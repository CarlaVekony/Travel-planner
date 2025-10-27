package com.example.vacationPlanner.controller;

import com.example.vacationPlanner.model.User;
import com.example.vacationPlanner.model.dto.UserDTO;
import com.example.vacationPlanner.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping
    public ResponseEntity<User> createOrUpdateUser(@RequestBody UserDTO userDTO) {
        User user = new User();
        user.setFirebaseUid(userDTO.getFirebaseUid());
        user.setEmail(userDTO.getEmail());
        user.setName(userDTO.getName());
        
        User savedUser = userService.createOrUpdateUser(user);
        return ResponseEntity.ok(savedUser);
    }
    
    @GetMapping("/firebase/{firebaseUid}")
    public ResponseEntity<User> getUserByFirebaseUid(@PathVariable String firebaseUid) {
        Optional<User> user = userService.getUserByFirebaseUid(firebaseUid);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
