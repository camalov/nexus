# Stage 1: Build Stage
FROM public.ecr.aws/gradle/gradle:8-jdk21 AS build
WORKDIR /app
COPY . .
RUN chmod +x ./gradlew && ./gradlew build -x test

# Stage 2: Runtime Stage
FROM public.ecr.aws/eclipse-temurin/temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar application.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "application.jar"]
