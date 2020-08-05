#!/bin/bash

################################################################################
#
# Stops 'bottius.service'
#
# Note: All variables are exported from 'linux-master-installer.sh', and
# 'debian-ubuntu-installer.sh' or 'centos-rhel-installer.sh'.
#
################################################################################
    
clear
read -p "We will now stop Bottius. Press [Enter] to begin."

if [[ $bottius_service_status = "active" ]]; then
    echo "Stopping 'bottius.service'..."
    systemctl stop bottius || {
        echo "${red}Failed to stop 'bottius.service'" >&2
        echo "${cyan}Failed to stop Bottius${nc}"
        read -p "Press [Enter] to return to the installer menu"
        exit 1
    }
    echo -e "\n${green}Bottius has been stopped${nc}"
else
    echo -e "\n${cyan}Bottius is currently not running${nc}"
fi   

read -p "Press [Enter] to return to the installer menu"
