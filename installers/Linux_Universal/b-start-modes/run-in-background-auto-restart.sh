#!/bin/bash

################################################################################
#
# Runs Bottius in the background, as a service on your system, with
# auto-restart on system reboot. This means that if the system is rebooted or
# is turned back on, Bottius will automatically be started. If
# Bottius is already running in this mode, he'll be restarted instead.
#
# Note: All variables (excluding $timer and $start_time) are exported from
# 'linux-master-installer.sh', and 'debian-ubuntu-installer.sh' or
# 'centos-rhel-installer.sh'.
#
################################################################################
#
    timer=20

    clear
    printf "We will now run Bottius in the background with auto-restart on system reboot. "
    read -p "Press [Enter] to begin."

    # Saves the current time and date, which will be used with journalctl
    start_time=$(date +"%F %H:%M:%S")

#
################################################################################
#
# Dealing with the enabling of 'bottius.service'
#
################################################################################
#
    # If 'bottius.service' exists and is not enabled
    if [[ -f $start_service && $start_service_status != 0 ]]; then
        echo "Enabling 'bottius.service'..."
        systemctl enable bottius.service || {
            echo "${red}Failed to enable 'bottius.service'" >&2
            echo "${cyan}This service must be enabled in order to run" \
                "Bottius in this run mode${nc}"
            read -p "Press [Enter] to return to the installer menu"
            exit 1
        }
    fi

#
################################################################################
#
# Starting and/or restarting 'bottius.service'
#
################################################################################
#
    if [[ $bottius_service_status = "active" ]]; then
        echo "Restarting 'bottius.service'..."
        systemctl restart bottius.service || {
            echo "${red}Failed to restart 'bottius.service'${nc}" >&2
            read -p "Press [Enter] to return to the installer menu"
            exit 1
        }
        echo "Waiting 20 seconds for 'bottius.service' to restart..."
    else
        echo "Starting 'bottius.service'..."
        systemctl start bottius.service || {
            echo "${red}Failed to start 'bottius.service'${nc}" >&2
            read -p "Press [Enter] to return to the installer menu"
            exit 1
        }
        echo "Waiting 20 seconds for 'bottius.service' to start..."
    fi

#
################################################################################
#
# Waits then displays the startup logs of 'bottius.service'
#
################################################################################
#
    # Waits in order to give 'bottius.service' enough time to (re)start
    while ((timer > 0)); do
        echo -en "${clrln}${timer} seconds left"
        sleep 1
        ((timer-=1))
    done

    # Lists the startup logs in order to better identify if and when
    # an error occurred during the startup of 'bottius.service'
    # Note: $no_hostname is purposefully unquoted. Do not quote those variables.
    echo -e "\n\n-------- bottius.service startup logs ---------" \
        "\n$(journalctl -u bottius -b $no_hostname -S "$start_time")" \
        "\n--------- End of bottius.service startup logs --------\n"

    echo -e "Please check the logs above to make sure that there aren't any" \
        "errors, and if there are, to resolve whatever issue is causing them\n"

    echo "${green}Bottius is now running in the background with auto-restart" \
        "on system reboot${nc}"
    read -p "Press [Enter] to return to the installer menu"