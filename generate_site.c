#include <stdio.h>
#include <time.h>

void generate_html() {
    FILE *fp = fopen("index.html", "w");
    if (fp == NULL) {
        printf("Error opening file!\n");
        return;
    }

    time_t now;
    time(&now);
    struct tm *local = localtime(&now);
    char time_str[100];
    strftime(time_str, sizeof(time_str), "%Y-%m-%d %H:%M:%S", local);

    fprintf(fp, "<!DOCTYPE html>\n");
    fprintf(fp, "<html lang=\"zh-CN\">\n");
    fprintf(fp, "<head>\n");
    fprintf(fp, "    <meta charset=\"UTF-8\">\n");
    fprintf(fp, "    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
    fprintf(fp, "    <title>My C Generated Site</title>\n");
    fprintf(fp, "    <style>\n");
    fprintf(fp, "        body {\n");
    fprintf(fp, "            font-family: 'Arial', sans-serif;\n");
    fprintf(fp, "            line-height: 1.6;\n");
    fprintf(fp, "            max-width: 800px;\n");
    fprintf(fp, "            margin: 0 auto;\n");
    fprintf(fp, "            padding: 20px;\n");
    fprintf(fp, "            background-color: #f5f5f5;\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        .container {\n");
    fprintf(fp, "            background-color: white;\n");
    fprintf(fp, "            padding: 20px;\n");
    fprintf(fp, "            border-radius: 8px;\n");
    fprintf(fp, "            box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n");
    fprintf(fp, "        }\n");
    fprintf(fp, "        h1 { color: #2c3e50; }\n");
    fprintf(fp, "        .timestamp { color: #666; font-size: 0.9em; }\n");
    fprintf(fp, "    </style>\n");
    fprintf(fp, "</head>\n");
    fprintf(fp, "<body>\n");
    fprintf(fp, "    <div class=\"container\">\n");
    fprintf(fp, "        <h1>Welcome to My C Generated Site</h1>\n");
    fprintf(fp, "        <p>This page was generated using C programming language.</p>\n");
    fprintf(fp, "        <p>C language offers high performance and efficiency in web development:</p>\n");
    fprintf(fp, "        <ul>\n");
    fprintf(fp, "            <li>Low-level system access</li>\n");
    fprintf(fp, "            <li>Efficient memory management</li>\n");
    fprintf(fp, "            <li>Fast execution speed</li>\n");
    fprintf(fp, "            <li>Small memory footprint</li>\n");
    fprintf(fp, "        </ul>\n");
    fprintf(fp, "        <p class=\"timestamp\">Page generated at: %s</p>\n", time_str);
    fprintf(fp, "    </div>\n");
    fprintf(fp, "</body>\n");
    fprintf(fp, "</html>\n");

    fclose(fp);
    printf("index.html has been generated successfully.\n");
}

int main() {
    generate_html();
    return 0;
}
