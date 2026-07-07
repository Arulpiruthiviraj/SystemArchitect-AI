#!/bin/bash

# System Design Lab - Single Point of Start Script
# ------------------------------------------------

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0;37m' # No Color
BOLD='\033[1m'

# Clear terminal screen
clear

# Draw elegant System Design Lab Header
echo -e "${CYAN}${BOLD}===================================================================${NC}"
echo -e "${CYAN}${BOLD}  ____             _                  ____            _             ${NC}"
echo -e "${CYAN}${BOLD} / ___| _   _  ___| |_ ___ _ __ ___  |  _ \  ___  ___(_) __ _ _ __  ${NC}"
echo -e "${CYAN}${BOLD} \___ \| | | |/ __| __/ _ \ '_ \` _ \ | | | |/ _ \/ __| |/ _\` | '_ \ ${NC}"
echo -e "${CYAN}${BOLD}  ___) | |_| |\__ \ |_  __/ | | | | || |_| |  __/\__ \ | (_| | | | |${NC}"
echo -e "${CYAN}${BOLD} |____/ \__, ||___/\__\___|_| |_| |_||____/ \___||___/_|\__, |_| |_|${NC}"
echo -e "${CYAN}${BOLD}        |___/                                           |___/       ${NC}"
echo -e "${CYAN}${BOLD}===================================================================${NC}"
echo -e "${YELLOW}${BOLD}     System Design Lab - Advanced Interactive Learning & Simulator${NC}"
echo -e "${CYAN}===================================================================${NC}"
echo ""

# Function to check dependencies and set up
perform_setup() {
    echo -e "${BLUE}[1/3] Checking system requirements...${NC}"
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed. Please install Node.js and try again.${NC}"
        exit 1
    fi
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed. Please install npm and try again.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Node.js $(node -v) is installed.${NC}"
    echo -e "${GREEN}✓ npm $(npm -v) is installed.${NC}"
    echo ""

    echo -e "${BLUE}[2/3] Checking environment configuration (.env)...${NC}"
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            echo -e "${YELLOW}.env file not found. Copying from .env.example...${NC}"
            cp .env.example .env
            echo -e "${GREEN}✓ .env file created from .env.example.${NC}"
        else
            echo -e "${RED}Warning: .env.example not found. Cannot auto-create .env.${NC}"
        fi
    else
        echo -e "${GREEN}✓ .env file already exists.${NC}"
    fi
    echo ""

    echo -e "${BLUE}[3/3] Checking package dependencies (npm install)...${NC}"
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}node_modules not found. Setting up application dependencies...${NC}"
        npm install
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Dependencies installed successfully!${NC}"
        else
            echo -e "${RED}Error: npm install failed.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✓ node_modules already exists. Skipping install.${NC}"
    fi
    echo ""
}

# Function to run the interactive challenge
run_cli_challenge() {
    clear
    echo -e "${PURPLE}${BOLD}===================================================================${NC}"
    echo -e "${PURPLE}${BOLD}      SYSTEM DESIGN LAB - MINI TERMINAL CHALLENGE                  ${NC}"
    echo -e "${PURPLE}${BOLD}===================================================================${NC}"
    echo -e "Test your knowledge on distributed systems concepts directly here!\n"
    
    echo -e "${YELLOW}Question 1: You are designing a real-time notification service for 50M users."
    echo -e "Which transport protocol achieves the lowest latency push with minimal overhead?${NC}"
    echo -e "  [1] HTTP/1.1 Short Polling"
    echo -e "  [2] WebSockets (Persistent TCP connection)"
    echo -e "  [3] SMTP"
    echo -e "  [4] DNS TXT Records"
    echo ""
    read -p "Enter choice (1-4): " q1_ans
    if [ "$q1_ans" == "2" ]; then
        echo -e "\n${GREEN}Correct! WebSockets allow bidirectional low-latency push without polling overhead.${NC}"
    else
        echo -e "\n${RED}Incorrect. The correct answer is 2 (WebSockets). Short polling wastes massive CPU and bandwidth.${NC}"
    fi
    echo ""

    echo -e "${YELLOW}Question 2: In a distributed system, what is consistent hashing primarily used for?${NC}"
    echo -e "  [1] Encrypting passwords"
    echo -e "  [2] Preventing SQL injection"
    echo -e "  [3] Minimizing data remapping when scaling cache or database clusters"
    echo -e "  [4] Accelerating CSS styles rendering"
    echo ""
    read -p "Enter choice (1-4): " q2_ans
    if [ "$q2_ans" == "3" ]; then
        echo -e "\n${GREEN}Correct! Consistent hashing maps keys and nodes to a circular space, reducing rehashing to 1/N average keys.${NC}"
    else
        echo -e "\n${RED}Incorrect. The correct answer is 3 (Minimizing data remapping).${NC}"
    fi
    echo ""

    echo -e "${YELLOW}Question 3: If your write-heavy database must guarantee absolute durability and never lose data, which Kafka Producer config is best?${NC}"
    echo -e "  [1] acks=0"
    echo -e "  [2] acks=1"
    echo -e "  [3] acks=all (acknowledgment from all in-sync replicas)"
    echo -e "  [4] retries=0"
    echo ""
    read -p "Enter choice (1-4): " q3_ans
    if [ "$q3_ans" == "3" ]; then
        echo -e "\n${GREEN}Correct! acks=all guarantees the message is replicated to all ISR nodes before acknowledging, making it highly durable.${NC}"
    else
        echo -e "\n${RED}Incorrect. The correct answer is 3 (acks=all). acks=0 is fire-and-forget and can easily lose data.${NC}"
    fi
    echo ""
    
    echo -e "${CYAN}Thank you for taking the System Design Lab terminal challenge!${NC}"
    read -p "Press [Enter] to return to the main menu..."
}

# Run setup
perform_setup

# Process command-line input if any argument was passed
if [ ! -z "$1" ]; then
    CMD_INPUT=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    echo -e "${BLUE}Running command line request: '${CMD_INPUT}'...${NC}"
    case "$CMD_INPUT" in
        dev|run)
            echo -e "${GREEN}Starting Development Server...${NC}"
            npm run dev
            ;;
        build)
            echo -e "${GREEN}Building Application...${NC}"
            npm run build
            ;;
        start|prod)
            echo -e "${GREEN}Starting Production Server...${NC}"
            npm run start
            ;;
        lint|test)
            echo -e "${GREEN}Running Linter / Type Checker...${NC}"
            npm run lint
            ;;
        challenge)
            run_cli_challenge
            ;;
        *)
            echo -e "${RED}Unknown command: '$1'${NC}"
            echo -e "Available commands: dev, build, start, lint, challenge"
            exit 1
            ;;
    esac
    exit 0
fi

# Main Menu loop
while true; do
    clear
    echo -e "${CYAN}${BOLD}===================================================================${NC}"
    echo -e "${CYAN}${BOLD}  ____             _                  ____            _             ${NC}"
    echo -e "${CYAN}${BOLD} / ___| _   _  ___| |_ ___ _ __ ___  |  _ \  ___  ___(_) __ _ _ __  ${NC}"
    echo -e "${CYAN}${BOLD} \___ \| | | |/ __| __/ _ \ '_ \` _ \ | | | |/ _ \/ __| |/ _\` | '_ \ ${NC}"
    echo -e "${CYAN}${BOLD}  ___) | |_| |\__ \ |_  __/ | | | | || |_| |  __/\__ \ | (_| | | | |${NC}"
    echo -e "${CYAN}${BOLD} |____/ \__, ||___/\__\___|_| |_| |_||____/ \___||___/_|\__, |_| |_|${NC}"
    echo -e "${CYAN}${BOLD}        |___/                                           |___/       ${NC}"
    echo -e "${CYAN}${BOLD}===================================================================${NC}"
    echo -e "${YELLOW}${BOLD}     System Design Lab - Advanced Interactive Learning & Simulator${NC}"
    echo -e "${CYAN}===================================================================${NC}"
    echo ""
    echo -e "Please select an option to execute:"
    echo -e "  ${BOLD}[1]${NC} ${GREEN}Start Development Server (Express API + Vite Frontend)${NC}"
    echo -e "  ${BOLD}[2]${NC} Build Application (Production Bundled Output)"
    echo -e "  ${BOLD}[3]${NC} Start Production Server (node dist/server.cjs)"
    echo -e "  ${BOLD}[4]${NC} Run Type Check & Linting Diagnostics"
    echo -e "  ${BOLD}[5]${NC} ${PURPLE}Play Interactive System Design Terminal Challenge${NC}"
    echo -e "  ${BOLD}[6]${NC} Exit"
    echo ""
    read -p "Select option (1-6): " choice
    
    case "$choice" in
        1)
            echo -e "\n${GREEN}Starting Development Server on Port 3000...${NC}"
            npm run dev
            break
            ;;
        2)
            echo -e "\n${BLUE}Building static assets and compiling full-stack server...${NC}"
            npm run build
            read -p "Build complete. Press [Enter] to continue..."
            ;;
        3)
            if [ ! -f "dist/server.cjs" ]; then
                echo -e "\n${RED}Production build not found. Running build first...${NC}"
                npm run build
            fi
            echo -e "\n${GREEN}Starting production bundle server on Port 3000...${NC}"
            npm run start
            break
            ;;
        4)
            echo -e "\n${BLUE}Running tsc type check...${NC}"
            npm run lint
            if [ $? -eq 0 ]; then
                echo -e "${GREEN}✓ Perfect! No TypeScript or lint errors detected.${NC}"
            else
                echo -e "${RED}⚠ Verification issues detected. Please fix outstanding code errors.${NC}"
            fi
            read -p "Press [Enter] to return to menu..."
            ;;
        5)
            run_cli_challenge
            ;;
        6)
            echo -e "\n${CYAN}Exiting System Design Lab Start Script. Goodbye!${NC}\n"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid option: Please choose a number from 1 to 6.${NC}"
            sleep 1.5
            ;;
    esac
done
