package com.example.GalleryApp.repository;

import com.example.GalleryApp.model.UserImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserImageRepository extends JpaRepository<UserImage, Long> {
    List<UserImage> findByUserId(Long userId);
    boolean existsByUserIdAndImageUrl(Long userId, String imageUrl);
}
