package com.example.vacationPlanner.service;

import com.example.vacationPlanner.model.User;
import com.example.vacationPlanner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public User createOrUpdateUser(User user) {
        Optional<User> existingUser = userRepository.findByFirebaseUid(user.getFirebaseUid());
        if (existingUser.isPresent()) {
            User userToUpdate = existingUser.get();
            userToUpdate.setEmail(user.getEmail());
            userToUpdate.setName(user.getName());
            return userRepository.save(userToUpdate);
        } else {
            return userRepository.save(user);
        }
    }
    
    public Optional<User> getUserByFirebaseUid(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid);
    }
    
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
