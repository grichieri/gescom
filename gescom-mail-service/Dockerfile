# --- Compilación ---
FROM gradle:9.7.1-jdk25 AS build
WORKDIR /app
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
COPY src ./src
RUN chmod +x gradlew && ./gradlew bootJar -x test --no-daemon

# --- Ejecución ---
FROM eclipse-temurin:25-jre
WORKDIR /app
RUN useradd --system --no-create-home gescom
COPY --from=build /app/build/libs/*.jar app.jar
USER gescom
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
