package com.uesc.telalogin.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private final byte[] secret;
  private final long expirationSeconds;

  public JwtService(
      @Value("${jwt.secret}") String secret,
      @Value("${jwt.expiration-seconds}") long expirationSeconds) {
    this.secret = secret.getBytes(StandardCharsets.UTF_8);
    this.expirationSeconds = expirationSeconds;
  }

  public long getExpirationSeconds() {
    return expirationSeconds;
  }

  public String generateToken(String email) {
    Instant now = Instant.now();
    JWTClaimsSet claims = new JWTClaimsSet.Builder()
        .subject(email)
        .issueTime(Date.from(now))
        .expirationTime(Date.from(now.plusSeconds(expirationSeconds)))
        .build();

    SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
    try {
      jwt.sign(new MACSigner(secret));
      return jwt.serialize();
    } catch (JOSEException e) {
      throw new IllegalStateException("Falha ao assinar JWT", e);
    }
  }

  public String validateAndGetEmail(String token) {
    try {
      SignedJWT jwt = SignedJWT.parse(token);
      if (!jwt.verify(new MACVerifier(secret))) {
        return null;
      }
      Date expiration = jwt.getJWTClaimsSet().getExpirationTime();
      if (expiration == null || expiration.before(new Date())) {
        return null;
      }
      return jwt.getJWTClaimsSet().getSubject();
    } catch (ParseException | JOSEException e) {
      return null;
    }
  }
}
