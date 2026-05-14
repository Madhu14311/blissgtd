// package com.bsgated.config;

// import com.bsgated.security.ApprovalRequiredFilter;
// import com.bsgated.security.JwtAuthenticationFilter;
// import com.bsgated.security.RestAccessDeniedHandler;
// import com.bsgated.security.RestAuthenticationEntryPoint;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.http.HttpMethod;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// import org.springframework.web.cors.CorsConfiguration;
// import org.springframework.web.cors.CorsConfigurationSource;
// import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

// import java.util.Arrays;
// import java.util.List;

// @Configuration
// public class SecurityConfig {

//     private final JwtAuthenticationFilter jwtAuthenticationFilter;
//     private final ApprovalRequiredFilter approvalRequiredFilter;
//     private final RestAuthenticationEntryPoint authenticationEntryPoint;
//     private final RestAccessDeniedHandler accessDeniedHandler;
//     private final String allowedOrigins;

//     public SecurityConfig(
//             JwtAuthenticationFilter jwtAuthenticationFilter,
//             ApprovalRequiredFilter approvalRequiredFilter,
//             RestAuthenticationEntryPoint authenticationEntryPoint,
//             RestAccessDeniedHandler accessDeniedHandler,
//             @Value("${app.cors.allowed-origins}") String allowedOrigins) {
//         this.jwtAuthenticationFilter = jwtAuthenticationFilter;
//         this.approvalRequiredFilter = approvalRequiredFilter;
//         this.authenticationEntryPoint = authenticationEntryPoint;
//         this.accessDeniedHandler = accessDeniedHandler;
//         this.allowedOrigins = allowedOrigins;
//     }

//     @Bean
//     public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//         return http
//                 .csrf(AbstractHttpConfigurer::disable)
//                 .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//                 .exceptionHandling(exceptions -> exceptions
//                         .authenticationEntryPoint(authenticationEntryPoint)
//                         .accessDeniedHandler(accessDeniedHandler))
//                 .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//                 .authorizeHttpRequests(auth -> auth
//                         .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
//                         .requestMatchers("/api/auth/register", "/api/auth/login", "/api/otp/send", "/api/otp/verify").permitAll()
//                         .requestMatchers("/api/admin/superadmin/**").hasRole("SUPER_ADMIN")
//                         .requestMatchers("/api/admin/approve/**").hasAnyRole("ADMIN", "SUPER_ADMIN")
//                         .requestMatchers("/api/admin/**").hasRole("ADMIN")
//                         .requestMatchers(HttpMethod.GET, "/api/deliveries/pending").hasRole("SECURITY")
//                         .requestMatchers("/api/deliveries/verify-otp", "/api/deliveries/*/delivered").hasRole("SECURITY")
//                         .requestMatchers("/api/deliveries/**").hasRole("RESIDENT")
//                         .requestMatchers("/api/auth/status/**", "/api/auth/submit-docs/**").authenticated()
//                         .anyRequest().authenticated())
//                 .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
//                 .addFilterAfter(approvalRequiredFilter, JwtAuthenticationFilter.class)
//                 .build();
//     }

//     @Bean
//     public CorsConfigurationSource corsConfigurationSource() {
//         CorsConfiguration configuration = new CorsConfiguration();
//         configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
//                 .map(String::trim)
//                 .filter(origin -> !origin.isBlank())
//                 .toList());
//         configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
//         configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
//         configuration.setExposedHeaders(List.of("Authorization"));
//         configuration.setAllowCredentials(false);

//         UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//         source.registerCorsConfiguration("/**", configuration);
//         return source;
//     }

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }
// }







package com.bsgated.config;

import com.bsgated.security.ApprovalRequiredFilter;
import com.bsgated.security.JwtAuthenticationFilter;
import com.bsgated.security.RestAccessDeniedHandler;
import com.bsgated.security.RestAuthenticationEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ApprovalRequiredFilter approvalRequiredFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final String allowedOrigins;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            ApprovalRequiredFilter approvalRequiredFilter,
            RestAuthenticationEntryPoint authenticationEntryPoint,
            RestAccessDeniedHandler accessDeniedHandler,
            @Value("${app.cors.allowed-origins}") String allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.approvalRequiredFilter  = approvalRequiredFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler     = accessDeniedHandler;
        this.allowedOrigins          = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── Preflight ──────────────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── Public auth & OTP ─────────────────────────────
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/otp/send",
                                "/api/otp/verify").permitAll()

                        // ── Super-admin only ──────────────────────────────
                        .requestMatchers("/api/admin/superadmin/**").hasRole("SUPER_ADMIN")

                        // ── Admin approval ────────────────────────────────
                        .requestMatchers("/api/admin/approve/**").hasAnyRole("ADMIN", "SUPER_ADMIN")

                        // ── Admin management ──────────────────────────────
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ── Security guard ────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/api/deliveries/pending").hasRole("SECURITY")
                        .requestMatchers(
                                "/api/deliveries/verify-otp",
                                "/api/deliveries/*/delivered").hasRole("SECURITY")

                        // ── Delivery passes (resident) ────────────────────
                        .requestMatchers("/api/deliveries/**").hasRole("RESIDENT")

                        // ── Vendor: store management ──────────────────────
                        .requestMatchers("/api/vendor/store/**").hasRole("VENDOR")

                        // ── Vendor: product management ────────────────────
                        .requestMatchers("/api/vendor/products/**").hasRole("VENDOR")

                        // ── Marketplace browsing (any authenticated + approved user) ──
                        .requestMatchers("/api/marketplace/**").authenticated()

                        // ── Auth status & doc submission ──────────────────
                        .requestMatchers(
                                "/api/auth/status/**",
                                "/api/auth/submit-docs/**").authenticated()

                        .anyRequest().authenticated())

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(approvalRequiredFilter, JwtAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(false);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
