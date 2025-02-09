#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <winsock2.h>
#include <ws2tcpip.h>

#pragma comment(lib, "ws2_32.lib")

#define PORT 8080
#define BUFFER_SIZE 1024

void handle_http_request(int client_socket) {
    char buffer[BUFFER_SIZE];
    FILE *html_file = fopen("index.html", "r");
    
    if (html_file == NULL) {
        const char *response = "HTTP/1.1 404 Not Found\r\n"
                             "Content-Type: text/plain\r\n"
                             "\r\n"
                             "404 - File not found";
        send(client_socket, response, strlen(response), 0);
        return;
    }

    // ??HTML????
    char *html_content = malloc(BUFFER_SIZE * 10);
    memset(html_content, 0, BUFFER_SIZE * 10);  // ?????
    size_t content_size = 0;
    
    while (fgets(buffer, BUFFER_SIZE, html_file)) {
        strcat(html_content, buffer);
    }
    fclose(html_file);

    // ??HTTP??
    char *header = "HTTP/1.1 200 OK\r\n"
                  "Content-Type: text/html; charset=utf-8\r\n"
                  "\r\n";
    
    send(client_socket, header, strlen(header), 0);
    send(client_socket, html_content, strlen(html_content), 0);
    
    free(html_content);
}

int main() {
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    int client_len = sizeof(client_addr);
    WSADATA wsaData;
    
    // ???Winsock
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        printf("WSAStartup failed\n");
        return 1;
    }

    // ??socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("Error creating socket");
        exit(1);
    }

    // ??socket??
    int opt = 1;
    if (setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt))) {
        perror("Error setting socket options");
        exit(1);
    }

    // ???????
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // ??socket
    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Error binding socket");
        exit(1);
    }

    // ????
    if (listen(server_socket, 10) < 0) {
        perror("Error listening");
        exit(1);
    }

    printf("Server running on port %d...\n", PORT);

    while (1) {
        // ??????
        client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_len);
        if (client_socket < 0) {
            perror("Error accepting connection");
            continue;
        }

        // ??HTTP??
        handle_http_request(client_socket);
        closesocket(client_socket);
    }

    closesocket(server_socket);
    WSACleanup();
    return 0;
}
