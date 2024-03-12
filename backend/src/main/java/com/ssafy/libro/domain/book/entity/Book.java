package com.ssafy.libro.domain.book.entity;

import com.ssafy.libro.domain.book.dto.BookUpdateRequestDto;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String isbn;
    private String title;
    private String summary;

    private Integer price;
    private Double rating;
    private Integer ratingCount;

    private String author;
    private String translator;
    private String publisher;
    private LocalDateTime pubDate;

    private String thumbnail;
    private String shortsUrl;


    @CreationTimestamp
    private LocalDateTime createdDate;
    @UpdateTimestamp
    private LocalDateTime updatedDate;

    public Book update(BookUpdateRequestDto requestDto) {
        this.isbn = requestDto.getIsbn();
        this.title = requestDto.getTitle();
        this.rating = requestDto.getRating();
        this.summary = requestDto.getSummary();
        this.author = requestDto.getAuthor();
        this.translator = requestDto.getTranslator();
        this.publisher = requestDto.getPublisher();
        this.thumbnail = requestDto.getThumbnail();
        this.shortsUrl = requestDto.getShortsUrl();
        return this;
    }

    public Book updateRating(Double rating) {
        this.rating = rating;
        return this;
    }

}