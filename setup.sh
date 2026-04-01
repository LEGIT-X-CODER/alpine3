#!/bin/sh
# setup.sh — Alpine 3 (Tomcat + Derby Storage)
# VM 3 handles Feature 3 (CRUD) ONLY. VM 2 proxies requests to this VM.

echo "🚀 Setting up VM 3 Storage..."
apk update
apk add openjdk17 maven tomcat10 git make

# Create DB dir
mkdir -p /opt/alpine-webtech/derbydb
chmod -R 777 /opt/alpine-webtech

# Build & Deploy
mvn clean package -DskipTests
cp target/alpine-webtech.war /var/lib/tomcat10/webapps/

# Start
rc-update add tomcat10 default
rc-service tomcat10 restart

echo "✅ VM 3 Storage Ready! Tomcat is at http://<VM3_IP>:8080/alpine-webtech/"
echo "📍 Nginx on VM 2 will proxy CRUD requests to this VM."
