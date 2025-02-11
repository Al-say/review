const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function updateWeather() {
    try {
        // 使用 MCP 工具获取天气数据
        const response = require('@modelcontextprotocol/sdk');
        const weatherData = await response.use_mcp_tool('weather', 'get_weather', {
            city: 'Beijing'
        });

        // 将天气数据写入文件
        const weatherDataPath = path.join(__dirname, 'js', 'weather-data.json');
        const dataToWrite = {
            temperature: weatherData.temperature,
            conditions: weatherData.conditions === 'overcast clouds' ? '多云' : '晴天',
            humidity: weatherData.humidity,
            wind_speed: weatherData.wind_speed,
            lastUpdated: new Date().toISOString()
        };

        fs.writeFileSync(weatherDataPath, JSON.stringify(dataToWrite, null, 2), 'utf8');
        console.log('天气数据已更新:', new Date().toLocaleString());
    } catch (error) {
        console.error('更新天气数据失败:', error);
    }
}

// 立即更新一次
updateWeather();

// 每5分钟更新一次
setInterval(updateWeather, 5 * 60 * 1000);
