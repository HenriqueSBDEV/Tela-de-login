package com.uesc.telalogin.auth;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class JwtServiceTest {

  @Autowired
  private JwtService jwtService;

  @Test
  void generateToken_andValidate_returnsEmail() {
    String token = jwtService.generateToken("aluno@uesc.br");

    assertThat(token).isNotBlank();
    assertThat(jwtService.validateAndGetEmail(token)).isEqualTo("aluno@uesc.br");
  }

  @Test
  void validateAndGetEmail_rejectsTamperedToken() {
    String token = jwtService.generateToken("aluno@uesc.br");
    String tampered = token.substring(0, token.length() - 4) + "xxxx";

    assertThat(jwtService.validateAndGetEmail(tampered)).isNull();
  }

  @Test
  void validateAndGetEmail_rejectsGarbage() {
    assertThat(jwtService.validateAndGetEmail("not-a-jwt")).isNull();
  }

  @Test
  void expirationSeconds_isConfigured() {
    assertThat(jwtService.getExpirationSeconds()).isEqualTo(3600);
  }
}
