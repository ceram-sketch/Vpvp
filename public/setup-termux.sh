#!/bin/bash

# Sasa Connect - Termux Setup Script
# این اسکریپت پیش‌نیازها را نصب کرده و پنل را اجرا می‌کند.

echo "=========================================="
echo "  Sasa Connect - Termux Setup"
echo "=========================================="

echo "[1/4] Updating Termux packages..."
pkg update -y && pkg upgrade -y

echo "[2/4] Installing required packages (nodejs, sing-box, git)..."
pkg install nodejs sing-box git -y

echo "[3/4] Setting up Sasa Connect directory..."
# Assuming the user has extracted the project to ~/sasa-connect
if [ ! -d "$HOME/sasa-connect" ]; then
  echo "خطا: پوشه sasa-connect در مسیر $HOME یافت نشد."
  echo "لطفاً فایل‌های پروژه را در مسیر ~/sasa-connect قرار دهید."
  exit 1
fi

cd ~/sasa-connect

echo "[4/4] Installing Node.js dependencies..."
npm install

echo "=========================================="
echo "Setup Complete! Starting Sasa Connect..."
echo "=========================================="
echo "Open your browser and go to: http://localhost:3000"
echo ""

# Run Next.js in development mode, bound to all interfaces
npm run dev -- --host
