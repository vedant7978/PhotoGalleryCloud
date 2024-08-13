package com.example.GalleryApp.service;

import com.example.GalleryApp.exception.DuplicateImageException;
import com.example.GalleryApp.model.User;
import com.example.GalleryApp.model.UserImage;
import com.example.GalleryApp.repository.UserImageRepository;
import com.example.GalleryApp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsSessionCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ImageService {

    private S3Client s3Client;
    private final String bucketName = "csci-5409-photogallery-bucket";

    @Autowired
    private UserImageRepository userImageRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${aws.accessKey}")
    private String accessKey;

    @Value("${aws.secretKey}")
    private String secretKey;

    @Value("${aws.sessionToken}")
    private String sessionToken;

    @PostConstruct
    public void initializeS3Client() {
        AwsSessionCredentials awsCreds = AwsSessionCredentials.create(accessKey, secretKey, sessionToken);
        this.s3Client = S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                .build();
    }

    public String uploadImage(MultipartFile file, Long userId) throws IOException {
        String fileName = file.getOriginalFilename();
        // Check if image already exists
        if (userImageRepository.existsByUserIdAndImageUrl(userId, "https://" + bucketName + ".s3.amazonaws.com/" + fileName)) {
            throw new DuplicateImageException("Image already exists: " + fileName);
        }
        String contentType = file.getContentType();
        InputStream fileInputStream = file.getInputStream();

        // Create PutObjectRequest
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(contentType)
                .build();

        // Upload the file to S3
        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(fileInputStream, file.getSize()));

        String imageUrl = "https://" + bucketName + ".s3.amazonaws.com/" + fileName;

        // Save image details to database
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        UserImage userImage = new UserImage();
        userImage.setImageUrl(imageUrl);
        userImage.setUser(user);

        userImageRepository.save(userImage);

        return imageUrl;
    }

    public List<String> listImages(Long userId) {
        List<UserImage> userImages = userImageRepository.findByUserId(userId);
        List<String> imageUrls = new ArrayList<>();

        for (UserImage userImage : userImages) {
            imageUrls.add(userImage.getImageUrl());
        }

        return imageUrls;
    }
}
