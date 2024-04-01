package com.ssafy.libro.domain.userbook.service;

import com.querydsl.core.Tuple;
import com.ssafy.libro.domain.book.dto.BookDetailResponseDto;
import com.ssafy.libro.domain.book.entity.Book;
import com.ssafy.libro.domain.book.exception.BookNotFoundException;
import com.ssafy.libro.domain.book.repository.BookRepository;
import com.ssafy.libro.domain.user.entity.User;
import com.ssafy.libro.domain.user.repository.UserRepository;
import com.ssafy.libro.domain.user.service.UserService;
import com.ssafy.libro.domain.userbook.dto.*;
import com.ssafy.libro.domain.userbook.entity.UserBook;
import com.ssafy.libro.domain.userbook.exception.NotReadBookException;
import com.ssafy.libro.domain.userbook.exception.UserBookNotFoundException;
import com.ssafy.libro.domain.userbook.repository.UserBookRepository;
import com.ssafy.libro.domain.userbookcomment.dto.UserBookCommentDetailResponseDto;
import com.ssafy.libro.domain.userbookcomment.entity.UserBookComment;
import com.ssafy.libro.domain.userbookcomment.repository.UserBookCommentRepository;
import com.ssafy.libro.domain.userbookhistory.dto.UserBookHistoryDetailResponseDto;
import com.ssafy.libro.domain.userbookhistory.entity.UserBookHistory;
import com.ssafy.libro.domain.userbookhistory.repository.UserBookHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserBookServiceImpl implements UserBookService{
    private final UserBookRepository userBookRepository;
    private final BookRepository bookRepository;
    private final UserBookHistoryRepository userBookHistoryRepository;
    private final UserBookCommentRepository userBookCommentRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    public List<UserBookListResponseDto> getUserBookList(){
        User user = userService.loadUser();
        List<UserBook> userBookList = userBookRepository.findUserBookByUser(user)
                .orElseThrow(() -> new UserBookNotFoundException("user : " + user.getId()));

        return getUserBookListResponseDtos(userBookList);
    }

    @Override
    public UserBookDetailResponseDto getUserBook(Long id) {
        UserBook userBook = userBookRepository.findById(id)
                .orElseThrow(()-> new UserBookNotFoundException(id));

        UserBookDetailResponseDto responseDto = new UserBookDetailResponseDto(userBook);

        // 사용자의 해당 도서를 읽은 기록
        Optional<List<UserBookHistory>>historyList = userBookHistoryRepository.findByUserBook(userBook);
        if(historyList.isPresent() && !historyList.get().isEmpty()){
            List<UserBookHistoryDetailResponseDto> historyDetailList = new ArrayList<>();
            for(UserBookHistory history : historyList.get()){
                historyDetailList.add(new UserBookHistoryDetailResponseDto(history));
            }
            responseDto.updateHistoryList(historyDetailList);
        }
        // 사용자가 해당 도서에 남긴 글귀

        Optional<List<UserBookComment>> commentList = userBookCommentRepository.findByUserBook(userBook);
        if(commentList.isPresent() && !commentList.get().isEmpty()){
            List<UserBookCommentDetailResponseDto> commentDetailList = new ArrayList<>();
            for(UserBookComment comment : commentList.get()){
                commentDetailList.add(new UserBookCommentDetailResponseDto(comment));

            }
            responseDto.updateCommentList(commentDetailList);
        }


        return responseDto;
    }

    @Override
    @Transactional
    public UserBookDetailResponseDto mappingUserBook(UserBookMappingRequestDto requestDto) {
        User user = userService.loadUser();
        Book book = bookRepository.findById(requestDto.getBookId())
                .orElseThrow(() -> new BookNotFoundException(requestDto.getBookId()));
        UserBook userBook = requestDto.toEntity();

        userBook.updateUser(user);
        userBook.updateBook(book);

        userBook = userBookRepository.save(userBook);

        return new UserBookDetailResponseDto(userBook);
    }

    @Override
    @Transactional
    public UserBookDetailResponseDto updateUserBook(UserBookUpdateRequestDto requestDto) {
        UserBook userBook = userBookRepository.findById(requestDto.getId())
                .orElseThrow(() -> new UserBookNotFoundException(requestDto.getId()));
        userBook.update(requestDto);
        userBook = userBookRepository.save(userBook);

        return new UserBookDetailResponseDto(userBook);
    }

    @Override
    @Transactional
    public void deleteUserBook(Long userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new UserBookNotFoundException(userBookId));

        userBook.updateDelete();
        userBookRepository.save(userBook);

    }

    @Override
    public List<UserBookListByDateResponseDto> getBookListByDate(Integer year, Integer month) {
        User user = userService.loadUser();
        // date parsing
        LocalDateTime startDateTime = LocalDateTime.of(year, month, 1, 0, 0);
        int lastDayOfMonth = Month.of(month).length(Year.isLeap(year));
        LocalDateTime endDateTime = LocalDateTime.of(year, month, lastDayOfMonth, 23, 59, 59);

        log.debug("service layer : startDate = {} , endDate = {}",startDateTime, endDateTime);

        List<UserBook> result = userBookRepository.findUserBookByUserAndDate(user,startDateTime,endDateTime)
                .orElseThrow(()-> new UserBookNotFoundException("userid : " + user.getId()));
        List<UserBookListByDateResponseDto> responseDtoList = new ArrayList<>();
        log.debug("service layer : result size = {}", result.size());

        for(UserBook userBook : result){
            List<UserBookHistoryDetailResponseDto> historyList = new ArrayList<>();
            for(UserBookHistory history : userBook.getUserBookHistoryList()){
                historyList.add(new UserBookHistoryDetailResponseDto(history));
            }
            UserBookListByDateResponseDto responseDto = UserBookListByDateResponseDto.builder()
                    .userBookId(userBook.getId())
                    .bookDetailResponseDto(new BookDetailResponseDto(userBook.getBook()))
                    .bookHistoryDetailResponseDto(historyList)
                    .build();
            responseDtoList.add(responseDto);
        }

        return responseDtoList;
    }

    @Override
    public Map<LocalDate, LinkedHashSet<Object>> getBookListByDateV2(Integer year, Integer month) {
        User user = userService.loadUser();

        LocalDateTime startDateTime = LocalDateTime.of(year, month, 1, 0, 0);
        int lastDayOfMonth = Month.of(month).length(Year.isLeap(year));
        LocalDateTime endDateTime = LocalDateTime.of(year, month, lastDayOfMonth, 23, 59, 59);

        List<UserBook> bookList = userBookRepository.findUserBookByUserAndDateV2(user,startDateTime,endDateTime)
                .orElseThrow(()-> new UserBookNotFoundException("userid : " + user.getId()));

        log.debug(bookList.size() + "");

        Map<LocalDate, LinkedHashSet<Object>> result = new HashMap<>();

        for (UserBook userBook : bookList) {
            userBook.getUserBookHistoryList().stream()
                    .sorted(Comparator.comparing(UserBookHistory::getEndDate).reversed())
                    .findAny()
                    .ifPresent(ubh -> {
                        String thumbnail = userBook.getBook().getThumbnail();
                        LocalDate endDate = ubh.getEndDate().toLocalDate();

                        result.computeIfAbsent(endDate, k -> new LinkedHashSet<>())
                                .add(thumbnail);
                    });
        }

        return result;
    }

    @Override
    @Transactional
    public UserBookDetailResponseDto updateRating(UserBookRatingRequestDto requestDto){
        UserBook userBook = userBookRepository.findById(requestDto.getUserBookId())
                .orElseThrow(() -> new UserBookNotFoundException(requestDto.getUserBookId()));
        // 다 못읽은 경우 에러처리

        if(!userBook.getIsComplete()){
            throw new NotReadBookException(requestDto.getUserBookId());
        }
        // 이미 한 기록을 수정하는지 여부 검사
        boolean isModify = false;
        double curRating = 0;

        if (userBook.getRating() != null){
            isModify = true;
            curRating = userBook.getRating();
        }

        userBook.updateRating(requestDto);

        userBookRepository.save(userBook);
        // book 정보 갱신
        Book book = userBook.getBook();

        double rating = book.getRating()==null ? 0.0 : book.getRating();
        int count = book.getRatingCount()==null ? 0 : book.getRatingCount();

        double updateRating;
        if(isModify){
            updateRating = (rating*count - curRating + requestDto.getRating())/count;
        }
        else{
            count ++;
            updateRating = (rating*(count) + requestDto.getRating())/count;
        }
        book.updateRating(updateRating, count);

        bookRepository.save(book);

        return new UserBookDetailResponseDto(userBook);
    }

    @Override
    @Transactional
    public UserBookDetailResponseDto updateType(UserBookTypeUpdateRequestDto requestDto) {
        UserBook userBook = userBookRepository.findById(requestDto.getUserBookId())
                .orElseThrow(() -> new UserBookNotFoundException(requestDto.getUserBookId()));

        userBook.updateType(requestDto.getType());
        userBookRepository.save(userBook);
        return new UserBookDetailResponseDto(userBook);
    }

    @Override
    public UserBookRatioResponseDto getUserReadRatio() {
        User user = userService.loadUser();
        long total = userBookRepository.countUserBookByUser(user)
                .orElseThrow(() -> new UserBookNotFoundException("no data"));
        long read = userBookRepository.countUserBookByUserReadComplete(user)
                .orElse(0L);

        log.info("호출당함...");

        return UserBookRatioResponseDto.builder()
                .type("user")
                .ratio(1.0*read/total)
                .totalSize(total)
                .readSize(read)
                .build();

    }

    @Override
    public UserBookRatioResponseDto getBookReadRatio(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException(bookId));

        long total = userBookRepository.countUserBookByBook(book)
                .orElseThrow(() -> new UserBookNotFoundException("no data"));
        long read  = userBookRepository.countUserBookByBookReadComplete(book)
                .orElse(0L);

        return UserBookRatioResponseDto.builder()
                .type("book")
                .ratio(1.0 * read / total)
                .totalSize(total)
                .readSize(read)
                .build();

    }

    @Override
    public List<UserBookListResponseDto> getUserBookOnReading() {
        User user = userService.loadUser();
        List<UserBook> userBookList = userBookRepository.findUserBookOnReading(user)
                .orElseThrow(() -> new UserBookNotFoundException("no data"));
        return getUserBookListResponseDtos(userBookList);
    }

    @Override
    public List<UserBookListResponseDto> getUserBookReadComplete() {
        User user = userService.loadUser();
        List<UserBook> userBookList = userBookRepository.findUserBookReadComplete(user)
                .orElseThrow(() -> new UserBookNotFoundException("no data"));
        return getUserBookListResponseDtos(userBookList);
    }

    @Override
    public List<UserCommentListResponseDto> getUserCommetList() {
        User user = userService.loadUser();
        List<UserBook> userBookList = userBookRepository.findUserBookCommentList(user)
                .orElseThrow(() -> new UserBookNotFoundException("user id : " + user.getId()));
        List<UserCommentListResponseDto> responseDtoList = new ArrayList<>();

        for(UserBook userBook : userBookList){
            List<UserBookCommentDetailResponseDto> commentList = new ArrayList<>();
            for(UserBookComment comment : userBook.getUserBookCommentList()){
                commentList.add(new UserBookCommentDetailResponseDto(comment));
            }


            responseDtoList.add(
                    UserCommentListResponseDto.builder()
                    .userBookId(userBook.getId())
                    .bookDetailResponseDto(new BookDetailResponseDto(userBook.getBook()))
                    .commentList(commentList)
                    .build()
            );
        }


        return responseDtoList;
    }

    @Override
    public UserBookRatioResponseDto getBookReadRatio(String isbn) {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new BookNotFoundException(isbn));
        long total = userBookRepository.countUserBookByBook(book)
                .orElseThrow(() -> new UserBookNotFoundException("no data"));
        long read  = userBookRepository.countUserBookByBookReadComplete(book)
                .orElse(0L);

        return UserBookRatioResponseDto.builder()
                .type("book")
                .ratio(1.0*read/total)
                .totalSize(total)
                .readSize(read)
                .build();
    }

    @Override
    public List<UserGenderAgeCountResponseDto> getUserGenderAgeCountList(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException(bookId));

        List<Tuple> result = userBookRepository.getUserGenderAgeCounts(book);
        List<UserGenderAgeCountResponseDto> responseDtoList = new ArrayList<>();
        for(Tuple tuple : result){
//            log.debug(tuple.toString());
            Integer age = tuple.get(0, Integer.class);
            Character gender = tuple.get(1, Character.class);
            Long count = tuple.get(2, Long.class);
            responseDtoList.add(
                    UserGenderAgeCountResponseDto.builder()
                    .age(age)
                    .gender(gender)
                    .count(count)
                    .build()
            );

        }

        return responseDtoList;
    }

    @Override
    public List<UserBookRatingSummary> getUserBookSummaryList(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new BookNotFoundException(bookId));

        List<Tuple> result = userBookRepository.getUserBookRating(book);
        List<UserBookRatingSummary> responseDtoList = new ArrayList<>();
        for(Tuple tuple : result){
//            log.debug(tuple.toString());
            Integer score = tuple.get(0, Double.class).intValue();
            Long count = tuple.get(1, Long.class);
           responseDtoList.add(
                   UserBookRatingSummary.builder()
                           .score(score)
                           .count(count)
                           .build()
           );
        }

        return responseDtoList;
    }

    @Override
    public List<UserBookRatingResponseDto> getUserBookRatingList(Long bookId) {
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new BookNotFoundException(bookId));
        List<UserBook> userBookList = userBookRepository.getUserBookRatingList(book).orElseThrow(() -> new UserBookNotFoundException("book :" + book.getId()));
        List<UserBookRatingResponseDto> responseDtoList = new ArrayList<>();
        for(UserBook userbook : userBookList){

            responseDtoList.add(
                    UserBookRatingResponseDto.builder()
                    .ratingComment(userbook.getRatingComment())
                    .rating(userbook.getRating())
                    .ratingSpoiler(userbook.getRatingSpoiler())
                    .build()
            );
        }

        return responseDtoList;
    }

    private List<UserBookListResponseDto> getUserBookListResponseDtos(List<UserBook> userBookList) {
        List<UserBookListResponseDto> responseDtoList = new ArrayList<>();
        for(UserBook userBook : userBookList){
            UserBookListResponseDto responseDto = UserBookListResponseDto.builder()
                    .userBookId(userBook.getId())
                    .type(userBook.getType())
                    .createdTime(userBook.getCreatedDate())
                    .updatedTime(userBook.getUpdatedDate())
                    .ratingSpoiler(userBook.getRatingSpoiler())
                    .rating(userBook.getRating())
                    .ratingComment(userBook.getRatingComment())
                    .isComplete(userBook.getIsComplete())
                    .isDeleted(userBook.getIsDeleted())
                    .bookDetailResponseDto(new BookDetailResponseDto(userBook.getBook()))
                    .build();

            responseDtoList.add(responseDto);
        }

        return responseDtoList;
    }



}
