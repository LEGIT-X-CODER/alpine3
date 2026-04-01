# Alpine 3 — Q3 Storage (Tomcat + Derby)

This VM handles the **CRUD Data Storage** for Question 3. VM 2 proxies requests to this VM.

### 🏗️ VM Setup
1.  **Clone** this repo to VM 3.
2.  **Run**: `sh setup.sh`
    -   Installs Java, Maven, Tomcat 10.
    -   Builds the API WAR.
    -   Deploys to `/var/lib/tomcat10/webapps/`.

### 🚀 Access
-   **URL**: `http://<VM3_IP>:8080/alpine-webtech/api/students`
-   **Scenario**: The CRUD page on VM 2 will call this VM to list, add, and delete students.

### 📁 Directory Paths
-   **Project**: `~/alpine/q3-vm2-storage/`
-   **Database**: `/opt/alpine-webtech/derbydb/` (Created automatically)
