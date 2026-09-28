package com.uesc.telalogin.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  void login_withValidCredentials_returnsBearerToken() throws Exception {
    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"aluno@uesc.br","senha":"senha123"}
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty())
        .andExpect(jsonPath("$.tokenType").value("Bearer"))
        .andExpect(jsonPath("$.expiresIn").value(3600));
  }

  @Test
  void login_withInvalidCredentials_returnsUnauthorized() throws Exception {
    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"aluno@uesc.br","senha":"errada"}
                """))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void me_withoutToken_returnsUnauthorized() throws Exception {
    mockMvc.perform(get("/api/me"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void fullFlow_loginThenAccessProtectedResourceWithJwt() throws Exception {
    MvcResult loginResult = mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"aluno@uesc.br","senha":"senha123"}
                """))
        .andExpect(status().isOk())
        .andReturn();

    JsonNode body = objectMapper.readTree(loginResult.getResponse().getContentAsString());
    String token = body.get("accessToken").asText();

    mockMvc.perform(get("/api/me")
            .header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.email").value("aluno@uesc.br"));
  }

  @Test
  void me_withInvalidToken_returnsUnauthorized() throws Exception {
    mockMvc.perform(get("/api/me")
            .header("Authorization", "Bearer invalid.token.value"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  void register_thenLogin_withCorrectAndWrongPassword() throws Exception {
    String email = "novo.aluno." + System.nanoTime() + "@uesc.br";

    mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"%s","senha":"minhaSenha"}
                """.formatted(email)))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.email").value(email));

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"%s","senha":"errada"}
                """.formatted(email)))
        .andExpect(status().isUnauthorized());

    mockMvc.perform(post("/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"%s","senha":"minhaSenha"}
                """.formatted(email)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.accessToken").isNotEmpty());
  }

  @Test
  void register_duplicateEmail_returnsConflict() throws Exception {
    mockMvc.perform(post("/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"aluno@uesc.br","senha":"outraSenha"}
                """))
        .andExpect(status().isConflict());
  }
}
