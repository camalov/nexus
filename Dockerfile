# Stage 1: Build Stage - Optimized for Layer Caching
FROM public.ecr.aws/docker/library/eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy build configuration files first to cache the dependency layer
COPY build.gradle settings.gradle ./
COPY gradlew ./
COPY gradle ./gradle/

# Make the wrapper script executable
RUN chmod +x ./gradlew

# Download dependencies. This layer will be cached as long as build.gradle doesn't change.
RUN ./gradlew build --no-daemon -x test -x classes || ./gradlew dependencies

# Now, copy the source code. Changes here won't invalidate the dependency cache.
COPY src ./src

# Build the application using the cached dependencies.
RUN ./gradlew build --no-daemon -x test

# Stage 2: Runtime Stage (No changes here)
FROM public.ecr.aws/docker/library/eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar application.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "application.jar"]
