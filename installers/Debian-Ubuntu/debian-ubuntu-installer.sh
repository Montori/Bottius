#!/bin/bash

################################################################################
#
# The sub-master installer that is used on Debian and Ubuntu Linux
# distributions.
#
# Note: All variables not defined in this script, are exported from
# 'linux-master-installer.sh'.
#
################################################################################
#
# Global [ variables ]
#
################################################################################
#
    home="/home/bottius"
    bottius_service="/lib/systemd/system/bottius.service"
    # Contains all of the files/directories that are associated with Bottius
    # (only files/directories located in the Bottius root directory)
    files=("installers/" "linux-master-installer.sh" "package-lock.json" \
        "package.json" "tsconfig.json" "source/" "README.md" "LICENSE" \
        "out/" ".gitignore/" ".git/")
    bottius_service_content="[Unit] \
        \nDescription=A service to start Bottius after a crash or system reboot \
        \nAfter=network.target postgresql.service  \
        \n  \
        \n[Service]  \
        \nUser=bottius  \
        \nExecStart=/usr/bin/node ${home}/out/bot.js  \
        \nRestart=always  \
        \nRestartSec=3  \
        \nStandardOutput=syslog  \
        \nStandardError=syslog  \
        \nSyslogIdentifier=bottius  \
        \n  \
        \n[Install]  \
        \nWantedBy=multi-user.target"

#
################################################################################
#
# [ Functions ]
#
################################################################################
#
    # This function deals with downloading and updating Bottius
    download_b() {
        clear
        printf "We will now download/update Bottius. "
        read -p "Press [Enter] to begin."
        
        old_bottius=$(date)
        repo="https://github.com/Montori/Bottius"

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Error trapping
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        trap "echo -e \"\n\nScript forcefully stopped\" && clean_up; echo \
            \"Exiting...\" && exit" SIGINT SIGTERM SIGTSTP

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Functions of the function
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #   
        # Cleans up any loose ends/left over files if the script exits
        clean_up() {
            echo "Cleaning up files and directories..."
            if [[ -d tmp ]]; then rm -r tmp/; fi

            if [[ ! -d source || ! -f package-lock.json || ! -f package.json ]]; then
                echo "Restoring from 'Old_Bottius/${old_bottius}'"
                cp -r Old_Bottius/"$old_bottius"/* . && cp -r Old_Bottius/"$old_bottius"/.* . || {
                    echo "${red}Failed to restore from 'Old_Bottius'${nc}" >&2
                }
            fi

            echo "Changing ownership of the file(s) in '/home/bottius'..."
            chown bottius:bottius -R "$home"
        }

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Prepping
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        if [[ $bottius_service_status = "active" ]]; then
            # B.1. $exists = true when 'bottius.service' is active, and is
            # used to indicate to the user that the service was stopped and that
            # they will need to start it
            exists="true"
            echo "Stopping 'bottius.service'..."
            systemctl stop bottius.service || {
                echo "${red}Failed to stop 'bottius.service'" >&2
                echo "${cyan}Manually stop 'bottius.service' before" \
                    "continuing${nc}"
                echo -e "\nExiting..."
                exit 1
            }
        fi
    
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Checking for required software/applications
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        # Installs curl if it isn't already
        if ! hash curl &>/dev/null; then
            echo "${yellow}curl is not installed${nc}"
            echo "Installing curl..."
            apt -y install curl || {
                echo "${red}Failed to install curl" >&2
                echo "${cyan}curl must be installed in order to continue${nc}"
                echo -e "\nExiting..."
                exit 1
            }
        fi
 
        # Installs wget if it isn't already
        if ! hash wget &>/dev/null; then
            echo "${yellow}wget is not installed${nc}"
            echo "Installing wget..."
            apt -y install wget || {
                echo "${red}Failed to install wget" >&2
                echo "${cyan}wget must be installed in order to continue${nc}"
                echo -e "\nExiting..."
                exit 1
            }
        fi

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Saving 'botconfig.json' and downloading/updating Bottius and its
    # services
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        if [[ ! -d Old_Bottius ]]; then
            echo "Creating 'Old_Bottius/'..."
            mkdir Old_Bottius
        fi

        echo "Creating 'Old_Bottius/${old_bottius}'..."
        mkdir Old_Bottius/"$old_bottius"
        # Makes sure that if the user made any changes to the botconfig.json
        # file, those changes or placed in source/botconfig.json so that
        # when the code is compiled, the changes will be passed to the new 
        # out/botconfig.json
        if [[ -f out/botconfig.json ]]; then
            cat out/botconfig.json > source/botconfig.json
        fi

        echo "Moving files/directories associated with Bottius to 'Old_Bottius/${old_bottius}'..."
        for dir in "${files[@]}"; do
            if [[ -d $dir || -f $dir ]]; then
                cp -rf "$dir" Old_Bottius/"$old_bottius" # TODO: Error catching
            fi
        done
     
        if [[ -d .git ]]; then
            echo "Updating Bottius..."
            git checkout -- \*
            git pull || {
                echo "${red}Failed to update Bottius${nc}" >&2
                clean_up
                echo -e "\nExiting..."
                exit 1
            }
        else
            echo "Downloading Bottius..."
            #git clone "$repo" tmp/ || {
            git clone --single-branch -b installers "$repo" tmp/ || {
                echo "${red}Failed to download Bottius${nc}" >&2
                clean_up
                echo -e "\nExiting..."
                exit 1
            }
            mv -f tmp/* . && mv -f tmp/.git* . || {
                echo "error"
                exit 1
            }
            rm -rf tmp
        fi
        
        # Checks if typescript is installed
        if ! hash tsc &>/dev/null || [[ ! -f source/botconfig.json ]]; then
            echo "Skipping typescript compilation..."
        else
            echo "Compiling typescript..."
            # TODO: make compile
        fi


        if [[ -f $bottius_service ]]; then
            echo "Updating 'bottius.service'..."
            local create_or_update="update"
        else
            echo "Creating 'bottius.service'..."
            local create_or_update="create"
        fi
        echo -e "$bottius_service_content" > "$bottius_service" || {
            echo "${red}Failed to $create_or_update 'bottius.service'${nc}" \
                >&2
            local b_s_update="Failed"
        }

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Cleaning up and presenting results...
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        echo "Changing ownership of the file(s) added to '/home/bottius'..."
        chown bottius:bottius -R "$home"
        echo -e "\n${green}Finished downloading/updating Bottius${nc}"
        
        if [[ $b_s_update ]] ;then
            echo "${yellow}WARNING: Failed to $create_or_update 'bottius.service'${nc}"
        fi

        # B.1.
        if [[ $bb_active ]]; then
            echo "${cyan}NOTE: 'bottius.service' was stopped to update" \
                "Bottius and has to be started using the run modes in the" \
                "installer menu${nc}"
        fi

        read -p "Press [Enter] to apply any existing changes to the installers"
        clear
        exec "$master_installer"
    }

#
################################################################################
#
# [ Main ] code
#
################################################################################
#
    echo -e "Welcome to the Bottius Debian/Ubuntu installer\n"

    while true; do
        # TODO: Numerics for $bottius_service_status like $start_service_status???
        bottius_service_status=$(systemctl is-active bottius.service)

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # Makes sure that the system user 'bottius' and the home directory
    # '/home/bottius' already exists, and that your working directory is
    # '/home/bottius'.
    # 
    # TL;DR: Makes sure that all necessary (important) services, files,
    # directories, and users exist and are in their proper locations.
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        # Creates a system user named 'bottius', if it does not already exist,
        # then creates a home directory for it
        if ! id -u bottius &>/dev/null; then
            echo "${yellow}System user 'bottius' does not exist${nc}" >&2
            echo "Creating system user 'bottius'..."
            adduser --system --group bottius || {
                echo "${red}Failed to create 'bottius'" >&2
                echo "${cyan}System user 'bottius' must exist in order to" \
                    "continue${nc}"
                echo -e "\nExiting..."
                exit 1
            }

            echo "Moving files/directories associated with Bottius to" \
                "'$home'..."
            for dir in "${files[@]}"; do
                # C.1. If two separate directories with the same name exist in
                # $home and the current dir...
                if [[ -d "${home}/${dir}" && -d $dir ]]; then
                    # D.1. Removes the directory in $home because an error would
                    # occur otherwise when moving $dir to $home
                    rm -rf "${home:?}/${dir:?}"
                fi
                # C.1. and D.1. are done because a directory can't overwrite
                # another directory that contains files
                mv -f "$dir" "$home" 2>/dev/null
            done
            
            echo "Changing ownership of the file(s) added to '/home/bottius'..."
            chown bottius:bottius -R "$home"
            cd "$home" || {
                echo "${red}Failed to change working directory to" \
                    "'/home/bottius'" >&2
                echo "${cyan}Change your working directory to '/home/bottius'" \
                    "${nc}"
                echo -e "\nExiting..."
                exit 1
            }
        # Creates bottius's home directory if it does not exist
        elif [[ ! -d $home ]]; then
            echo "${yellow}bottius's home directory does not exist${nc}" >&2
            echo "Creating '$home'..."
            mkdir "$home"

            echo "Moving files/directories associated with Bottius to" \
                "'$home'..."
            for dir in "${files[@]}"; do
                # C.1.
                if [[ -d "${home}/${dir}" && -d $dir ]]; then
                    # D.1.
                    rm -rf "${home:?}/${dir:?}"
                fi
                mv -f "$dir" "$home" 2>/dev/null
            done

            echo "Changing ownership of the file(s) added to '/home/bottius'..."
            chown bottius:bottius -R "$home"
            cd "$home" || {
                echo "${red}Failed to change working directory to" \
                    "'/home/bottius'" >&2
                echo "${cyan}Change your working directory to '/home/bottius'" \
                    "${nc}"
                echo -e "\nExiting..."
                exit 1
            }
        fi

        if [[ $PWD != "/home/bottius" ]]; then
            echo "Moving files/directories associated with Bottius to" \
                "'$home'..."
            for dir in "${files[@]}"; do
                # C.1.
                if [[ -d "${home}/${dir}" && -d $dir ]]; then
                    # D.1.
                    rm -rf "${home:?}/${dir:?}"
                fi
                mv -f "$dir" "$home" 2>/dev/null
            done

            echo "Changing ownership of the file(s) added to '/home/bottius'..."
            chown bottius:bottius -R "$home"
            cd "$home" || {
                echo "${red}Failed to change working directory to" \
                    "'/home/bottius'" >&2
                echo "${cyan}Change your working directory to '/home/bottius'" \
                    "${nc}"
                echo -e "\nExiting..."
                exit 1
            }
        fi   

        # E.1. Creates 'bottius.service', if it does not exist
        if [[ ! -f $bottius_service ]]; then
            echo "Creating 'bottius.service'..."
            echo -e "$bottius_service_content" > "$bottius_service" || {
                echo "${red}Failed to create 'bottius.service'" >&2
                echo "${cyan}This service must exist for Bottius to work${nc}"
                echo -e "\nExiting..."
                exit 1
            }
            # Reloads systemd daemons to account for the added service
            systemctl daemon-reload
        fi

    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
    # User options for installing perquisites, downloading Bottius, and
    # starting Bottius in different run modes
    #
    # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #
    #
        # Checks to see if it is necessary to download Bottius
        if [[ ! -d source && ! -d out ]]; then
            echo "${cyan}Bottius is not been downloaded. To continue," \
                "please download Bottius using option 1.${nc}"

            echo "1. Download Bottius"
            echo "2. Stop and exit script"
            read option
            case "$option" in
                1)
                    download_b
                    clear
                    ;;
                2)
                    echo -e "\nExiting..."
                    exit 0
                    ;;
                *)
                    clear
                    echo "${red}Invalid input: '$option' is not a valid" \
                        "option${nc}" >&2
                    continue
                    ;;
            esac
        # If any of the prerequisites are not installed or set up, the user will
        # be required to install them using the options below
        elif (! hash psql || ! hash node || ! hash npm || [[ ! -f \
                out/botconfig.json || ! -f ormconfig.json || ! -d node_modules \
                ]]) &>/dev/null; then
            echo "${cyan}Some or all prerequisites are not installed. Due to" \
                "this, all options to run Bottius have been hidden until all" \
                "the prerequisites are installed and setup.${nc}"
            echo "1. Download/update Bottius"

            if ! hash psql &>/dev/null; then
                echo "2. Install Postgres ${red}(Not installed)${nc}"
            else
                echo "2. Install Postgres ${green}(Already installed)${nc}"
            fi
            
            if (! hash node || ! hash npm || ! hash nodejs) &>/dev/null; then
                echo "3. Install Node.js (will also perform the actions of" \
                    "option 4) ${red}(Not installed)${nc}"
            else
                echo "3. Install Node.js (will also perform the actions of" \
                    "option 4) ${green}(Already installed)${nc}"
            fi

            if [[ ! -d node_modules ]] &>/dev/null; then
                echo "4. Install required packages and dependencies" \
                    "${red}(Already installed)${nc}"
            else
                echo "4. Install required packages and dependencies" \
                    "${green}(Already installed)${nc}"
            fi

            if [[ ! -f source/botconfig.json ]]; then
                echo "5. Set up botconfig.json ${red}(Not setup)${nc}"
            else
                echo "5. Set up botconfig.json ${green}(Already" \
                    "setup)${nc}"
            fi

            if [[ ! -f ormconfig.json ]]; then
                echo "6. Set up ormconfig.json ${red}(Not setup)${nc}"
            else
                echo "6. Set up ormconfig.json ${green}(Already" \
                    "setup)${nc}"
            fi

            if [[ ! -d out/ ]]; then
                echo "7. Compile code ${red}(Not compiled)${nc}"
            else
                echo "7. Compile code ${green}(Already compiled)${nc}"
            fi
            #### TODO: STUFF BELOW
            echo "8. Stop and exit script"
            read option
            case "$option" in
                1)
                    download_b
                    clear
                    ;;
                2)
                    ./installers/Debian-Ubuntu/postgres-installer.sh
                    clear
                    ;;
                3)
                    export option
                    ./installers/Debian-Ubuntu/nodejs-installer.sh
                    clear
                    ;;
                4)
                    export option
                    ./installers/Debian-Ubuntu/nodejs-installer.sh
                    clear
                    ;;
                5)
                    export bottius_service_status
                    ./installers/Linux_Universal/setup/bot-config-setup.sh
                    clear
                    ;;
                6)
                    #export 
                    ./installers/Linux_Universal/setup/orm-config-setup.sh
                    clear
                    ;;
                7)
                    clear
                    if [[ ! -f source/botconfig.json ]]; then
                        echo "${yellow}'botconfig.json' doesn't exist. Before" \
                            "compiling the code, create botconfig.json via" \
                            "option 5 on the installer menu"
                        continue
                    fi
                    printf "We will now compile the bottius code. "
                    read -p "Press [Enter] to continue."
                    echo "Compiling code..."
                    tsc || {
                        echo "${red}Failed to compile code${nc}" >&2
                        continue
                    }
                    echo -e "\n${cyan}If there are any errors, resolve whatever issue is" \
                        "causing them, then attempt to compile the code again\n"
                    read -p "Press [Enter] to return to the installer menu"
                    clear
                    ;;
                8)
                    echo -e "\nExiting..."
                    exit 0
                    ;;
                *)
                    clear
                    echo "${red}Invalid input: '$option' is not a valid" \
                        "option${nc}" >&2
                    continue
                    ;;
            esac
        # Bottius run mode options
        else 
            if [[ $start_service_status = 0 && -f $bottius_service && $bottius_service_status \
                    = "active" ]]; then
                # E.1.
                if [[ ! -f $start_script ]]; then
                    echo "${yellow}WARNING: 'bottius-mongo-start.sh' does not" \
                        "exist and will prevent Bottius from auto-restarting" \
                        "on system reboot/start"
                    echo "${cyan}Either re-download Bottius via the installer" \
                        "or run Bottius only in the background${nc}"
                fi

                echo "1. Download/update Bottius and auto-restart files/services"
                echo "2. Run Bottius in the background"
                echo "3. Run Bottius in the background with auto-restart${green}" \
                    "(Running in this mode)${nc}"
            elif [[ $start_service_status = 0 && -f $bottius_service && $bottius_service_status \
                    != "active" ]]; then
                # E.1.
                if [[ ! -f $start_script ]]; then
                    echo "${yellow}WARNING: 'bottius-mongo-start.sh' does not" \
                        "exist and will prevent Bottius from auto-restarting" \
                        "on system reboot/start"
                    echo "${cyan}Either re-download Bottius via the installer" \
                        "or run Bottius only in the background${nc}"
                fi

                echo "1. Download/update Bottius and auto-restart files/services"
                echo "2. Run Bottius in the background"
                echo "3. Run Bottius in the background with auto-restart${yellow}" \
                    "(Setup to use this mode)${nc}"
            elif [[ -f $bottius_service && $bottius_service_status = "active" ]]; then
                echo "1. Download/update Bottius and auto-restart files/services"
                echo "2. Run Bottius in the background ${green}(Running in" \
                    "this mode)${nc}"
                echo "3. Run Bottius in the background with auto-restart"
            elif [[ -f $bottius_service && $bottius_service_status != "active" ]]; then
                echo "1. Download/update Bottius and auto-restart files/services"
                echo "2. Run Bottius in the background ${yellow}(Setup to" \
                    "use this mode)${nc}"
                echo "3. Run Bottius in the background with auto-restart"
            # If this occurs, that means that 'bottius.service' has not been created
            # for some reason
            else
                echo "1. Download/update Bottius and auto-restart files/services"
                echo "2. Run Bottius in the background"
                echo "3. Run Bottius in the background with auto-restart"
            fi

            echo "4. Stop Bottius"
            echo "5. Create new/update Bottius config file"
            echo "6. Stop and exit script"
            read option
            case "$option" in
                1)
                    download_b
                    clear
                    ;;
                2)
                    export home
                    export bottius_service_status
                    export start_script
                    export start_service_status
                    export bottius_service
                    ./installers/Linux_Universal/b-start-modes/run-in-background.sh
                    clear
                    ;;
                3)
                    export home
                    export bottius_service_status
                    export start_script
                    export start_service_status
                    export start_service
                    ./installers/Linux_Universal/b-start-modes/run-in-background-auto-restart.sh
                    clear
                    ;;
                4)
                    export bottius_service_status
                    ./installers/Linux_Universal/b-stop.sh
                    clear
                    ;;
                5)
                    export bottius_service_status
                    ./installers/Linux_Universal/setup/bot-config-setup.sh
                    clear
                    ;;
                6)
                    echo -e "\nExiting..."
                    exit 0
                    ;;
                *)
                    clear
                    echo "${red}Invalid input: '$option' is not a valid" \
                        "option${nc}" >&2
                    continue
                    ;;
            esac
        fi
    done
