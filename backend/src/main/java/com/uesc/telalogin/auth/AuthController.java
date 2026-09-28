package com.uesc.telalogin.auth;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final UserDetailsManager userDetailsManager;
  private final PasswordEncoder passwordEncoder;

  public AuthController(
      AuthenticationManager authenticationManager,
      JwtService jwtService,
      UserDetailsManager userDetailsManager,
      PasswordEncoder passwordEncoder) {
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.userDetailsManager = userDetailsManager;
    this.passwordEncoder = passwordEncoder;
  }

  @PostMapping("/auth/login")
  public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    if (isBlank(request.email()) || isBlank(request.senha())) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.email().trim(), request.senha()));
      String token = jwtService.generateToken(request.email().trim());
      return ResponseEntity.ok(
          new LoginResponse(token, "Bearer", jwtService.getExpirationSeconds()));
    } catch (BadCredentialsException ex) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @PostMapping("/auth/register")
  public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
    if (isBlank(request.email()) || !request.email().contains("@")) {
      return ResponseEntity.badRequest()
          .body(new RegisterResponse(null, "Informe um e-mail válido."));
    }
    if (isBlank(request.senha()) || request.senha().length() < 6) {
      return ResponseEntity.badRequest()
          .body(new RegisterResponse(null, "A senha deve ter pelo menos 6 caracteres."));
    }

    String email = request.email().trim().toLowerCase();
    if (userDetailsManager.userExists(email)) {
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(new RegisterResponse(email, "Já existe uma conta com este e-mail."));
    }

    userDetailsManager.createUser(
        User.builder()
            .username(email)
            .password(passwordEncoder.encode(request.senha()))
            .roles("USER")
            .build());

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(new RegisterResponse(email, "Conta criada com sucesso."));
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }
}
