@echo off

REM 检查是否安装了Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo 未检测到Node.js，请先安装Node.js
    echo 安装地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否安装了依赖
if not exist node_modules (
    echo 正在安装依赖...
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

REM 启动开发服务器
npm run dev

pause