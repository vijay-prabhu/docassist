FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY ../pom.xml /app/parent-pom.xml
COPY ../common /app/common
COPY pom.xml .
COPY src ./src
RUN mvn -f /app/parent-pom.xml install -pl common -am -DskipTests -q && \
    mvn package -DskipTests -q

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir -p /app/uploads
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
