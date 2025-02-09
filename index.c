#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void print_header() {
    printf("Content-type: text/html\n\n");
}

void print_style() {
    printf("<style>\n");
    printf("pre { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }\n");
    printf("body { font-family: monospace; max-width: 800px; margin: 20px auto; padding: 0 20px; }\n");
    printf("</style>\n");
}

int main() {
    print_header();
    printf("<!DOCTYPE html>\n<html>\n<head>\n");
    printf("<title>C Language Website</title>\n");
    printf("<meta charset=\"UTF-8\">\n");
    print_style();
    printf("</head>\n<body>\n");

    printf("<h1>C语言编写的网站</h1>\n");
    
    printf("<pre>\n");
    printf("#include &lt;stdio.h&gt;\n");
    printf("#include &lt;stdlib.h&gt;\n\n");
    printf("int main() {\n");
    printf("    printf(\"Welcome to my C website!\\n\");\n");
    printf("    return 0;\n");
    printf("}\n");
    printf("</pre>\n");

    printf("<h2>特点：</h2>\n");
    printf("<pre>\n");
    printf("1. 使用C语言编写\n");
    printf("2. 高效的内存管理\n");
    printf("3. 直接系统调用\n");
    printf("4. 快速执行速度\n");
    printf("</pre>\n");

    printf("<h2>代码示例：</h2>\n");
    printf("<pre>\n");
    printf("/* 高效的内存管理示例 */\n");
    printf("void *memory = malloc(1024);\n");
    printf("if (memory != NULL) {\n");
    printf("    /* 使用内存 */\n");
    printf("    free(memory);\n");
    printf("}\n");
    printf("</pre>\n");

    printf("<h2>系统信息：</h2>\n");
    printf("<pre>\n");
    printf("Compiled time: %s %s\n", __DATE__, __TIME__);
    printf("File: %s\n", __FILE__);
    printf("</pre>\n");

    printf("</body>\n</html>");
    return 0;
}
