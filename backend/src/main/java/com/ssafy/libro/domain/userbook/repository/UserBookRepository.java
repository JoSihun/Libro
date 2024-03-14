package com.ssafy.libro.domain.userbook.repository;

import com.ssafy.libro.domain.book.entity.Book;
import com.ssafy.libro.domain.user.entity.User;
import com.ssafy.libro.domain.userbook.entity.UserBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBookRepository extends JpaRepository<UserBook,Long> {
    Optional<List<UserBook>> findByUser (User user);
    Optional<List<UserBook>> findByUserAndBook(User user, Book book);

}