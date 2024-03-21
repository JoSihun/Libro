package com.ssafy.libro.domain.shorts.repository;

import com.ssafy.libro.domain.shorts.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    Optional<Task> findByIsbn(String isbn);
    Optional<List<Task>> findAllByStatus(Boolean status);
    Optional<List<Task>> findAllByTitleContaining(String title);
    Optional<List<Task>> findAllBySummaryContaining(String summary);
    Optional<List<Task>> findAllByKorPromptContaining(String korPrompt);
    Optional<List<Task>> findAllByEngPromptContaining(String engPrompt);

}
