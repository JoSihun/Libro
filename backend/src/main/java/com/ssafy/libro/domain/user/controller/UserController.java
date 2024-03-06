package com.ssafy.libro.domain.user.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/api/login")
@RestController
public class UserController {
    @GetMapping("/hello")
    public String hello(){
        return "hello!!";
    }
}
