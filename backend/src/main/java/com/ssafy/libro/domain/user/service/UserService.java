package com.ssafy.libro.domain.user.service;

import com.ssafy.libro.domain.user.dto.UserJoinRequestDto;
import com.ssafy.libro.domain.user.entity.User;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface UserService {
    User loadUser(String token);
    ResponseEntity<Map<String,Object>> joinUser(UserJoinRequestDto requestDto);
}
