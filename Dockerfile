# Stage 1: Build Stage
# We only need a JDK environment. The Gradle Wrapper (./gradlew) will download Gradle itself.
# We will use the official Eclipse Temurin JDK image from the ECR Public mirror.
FROM public.ecr.aws/docker/library/eclipse-temurin:21-jdk AS build

WORKDIR /app
COPY . .
# Make the wrapper script executable and run the build.
RUN chmod +x ./gradlew && ./gradlew build -x test

# Stage 2: Runtime Stage
# Use the lightweight JRE (Java Runtime Environment) for the final application image.
FROM public.ecr.aws/docker/library/eclipse-temurin:21-jre

WORKDIR /app
# Copy only the final application JAR from the build stage.
COPY --from=build /app/build/libs/*.jar application.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "application.jar"]
