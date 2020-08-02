#!/bin/bash

################################################################################
#
# The sub-master installer that is used on CentOS and RHEL Linux
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
    # (only files/directories located in the root directory)
    files=("installers/" "linux-master-installer.sh" "package-lock.json" \
        "package.json" "tsconfig.json" "source/" "README.md" "LICENSE" \
        "out/" ".gitignore/" ".git/")
    bottius_service_content="[Unit] \
        \nDescription=Starts Bottius after a crash or system reboot \
        \nAfter=network.target postgresql-12.service  \
        \n  \
        \n[Service]  \
        \nUser=bottius  \
        \nWorkingDirectory=${home} \
        \nExecStart=/usr/bin/node out/bot.js \
        \n#ExecStart=/usr/bin/node ${home}/out/bot.js  \
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
    change_ownership() {
        echo "Changing ownership of the file(s) added to '/home/bottius'..."
        chown bottius:bottius -R "$home"
        cd "$home" || {
            echo "${red}Failed to change working directory to" \
                "'/home/bottius'" >&2
            echo "${cyan}Change your working directory to '/home/bottius'${nc}"
            echo -e "\nExiting..."
            exit 1
        }
    }

    move_to_home() {
        echo "Moving files/directories associated with Bottius to '$home'..."
        for dir in "${files[@]}"; do
            # C.1. If two separate directories with the same name exist in
            # $home and the current dir...
            if [[ -d "${home}/${dir}" && -d $dir ]]; then
                # D.1. Removes the directory in $home because an error would
                # occur when moving $dir to $home
                rm -rf "${home:?}/${dir:?}"
            fi
            # C.1. and D.1. are done because a directory can't overwrite
            # another directory that contains files
            mv -f "$dir" "$home" 2>/dev/null
        done
    }

    # Downloads and updates Bottius
    download_bot() {
        clear
        printf "We will now download/update Bottius. "
        read -p "Press [Enter] to begin."
        
        old_bottius=$(date)
        repo="https://github.com/Montori/Bottius"

    ############################################################################
    # Error trapping
    ############################################################################
    #
        trap "echo -e \"\n\nScript forcefully stopped\" && clean_up; echo \
            \"Exiting...\" && exit" SIGINT SIGTERM SIGTSTP

    ############################################################################
    # Sub-functions
    ############################################################################
    #   
        # Cleans up any loose ends/left over files
        clean_up() {
            echo "Cleaning up files and directories..."
            if [[ -d tmp ]]; then rm -r tmp/; fi

            if [[ ! -d source || ! -f package-lock.json || ! -f package.json ]]; then
                echo "Restoring from 'Old_Bottius/${old_bottius}'"
                cp -rf Old_Bottius/"$old_bottius"/* . && cp -rf Old_Bottius/"$old_bottius"/.* . || {
                    echo "${red}Failed to restore from 'Old_Bottius'${nc}" >&2
                }
            fi

            echo "Changing ownership of the file(s) in '/home/bottius'..."
            chown bottius:bottius -R "$home"
        }

        # Installs software/applications used by the installers
        required_software() {
            if ! hash "$1" &>/dev/null; then
                echo "${yellow}${1} is not installed${nc}"
                echo "Installing ${1}..."
                yum -y install "$1" || {
                    echo "${red}Failed to install $1" >&2
                    echo "${cyan}${1} must be installed to continue${nc}"
                    echo -e "\nExiting..."
                    exit 1
                }
            fi
        }

    ############################################################################
    # Prepping
    ############################################################################
    #
        if [[ $bottius_service_status = "active" ]]; then
            # B.1. $bot_sysctl_active = true when 'bottius.service' is active,
            # and is used to indicate to the user that the service was stopped
            # and that they will need to start it
            local bot_sysctl_active="true"
            echo "Stopping 'bottius.service'..."
            systemctl stop bottius.service || {
                echo "${red}Failed to stop 'bottius.service'" >&2
                echo "${cyan}You will need to restart 'bottius.service' to" \
                    "apply any updates to Bottius${nc}"
            }
        fi
    
    ############################################################################
    # Checking for required software/applications
    ############################################################################
    #
        required_software "curl"
        required_software "wget"
        required_software "git"
        required_software "gpg2"

    ############################################################################
    # Creating backups of current code in /home/Bottius before downloading/
    # updating Bottius 
    ############################################################################
    #
        if [[ ! -d Old_Bottius ]]; then
            echo "Creating 'Old_Bottius/'..."
            mkdir Old_Bottius
        fi

        echo "Creating 'Old_Bottius/${old_bottius}'..."
        mkdir Old_Bottius/"$old_bottius"
        # Makes sure that any changes to 'out/botconfig.json' by the user, are
        # made to 'source/botconfig.json' so when the code is compiled, the
        # changes will be passed to the new 'out/botconfig.json'
        if [[ -f out/botconfig.json ]]; then
            cat out/botconfig.json > source/botconfig.json
        fi

        echo "Backing up code to 'Old_Bottius/${old_bottius}'..."
        for dir in "${files[@]}"; do
            if [[ -d $dir || -f $dir ]]; then
                cp -rf "$dir" Old_Bottius/"$old_bottius" || {
                    echo "${red}Failed to backup the code to 'Old_Bottius/${old_bottius}'${nc}" >&2
                }
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
                echo "${red}Failed to move updated code from tmp/ to ." >&2
                echo "${cyan}Manually move all the files from tmp to .${nc}"
                echo -e "\nExiting..."
                exit 1
            }
            rm -rf tmp
        fi
        
        # Checks if typescript is installed
        if ! hash tsc &>/dev/null || [[ ! -f source/botconfig.json ]]; then
            echo "Skipping typescript compilation..."
        else
            echo "Compiling code..."
            tsc || {
                echo "${red}Failed to compile code${nc}" >&2
                echo -e "\nExiting..."
                exit 1
            }
            echo -e "\n${cyan}If there are any errors, resolve whatever issue" \
                "is causing them, then attempt to compile the code again\n${nc}"
        fi

        if [[ -f $bottius_service ]]; then
            echo "Updating 'bottius.service'..."
            local create_or_update="update"
        else
            echo "Creating 'bottius.service'..."
            local create_or_update="create"
        fi
        # TODO: Have the services updated with any new code the first time
        # around, instead of the second time around (you have to run the
        # download option twice before it will actually update the services
        # due to the placement of the code)
        echo -e "$bottius_service_content" > "$bottius_service" || {
            echo "${red}Failed to $create_or_update 'bottius.service'${nc}" >&2
            local b_s_update="Failed"
        }

    ############################################################################
    # Cleaning up and presenting results...
    ############################################################################
    #
        echo "Changing ownership of the file(s) added to '/home/bottius'..."
        chown bottius:bottius -R "$home"
        echo -e "\n${green}Finished downloading/updating Bottius${nc}"
        
        if [[ $b_s_update ]] ;then
            echo "${yellow}WARNING: Failed to $create_or_update 'bottius.service'${nc}"
        fi

        # B.1.
        if [[ $bot_sysctl_active ]]; then
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
    echo -e "Welcome to the Bottius CentOS/RHEL installer\n"

    while true; do
        # TODO: Numerics for $bottius_service_status like $bottius_service_startup???
        bottius_service_status=$(systemctl is-active bottius.service)
        bottius_service_startup=$(systemctl is-enabled --quiet bottius.service \
            2>/dev/null; echo $?)
        database_user_exist=$(sudo -u postgres -H sh -c "psql postgres -tAc \
            \"SELECT 1 FROM pg_roles WHERE rolname='Bottius'\"" 2>/dev/null)
        database_exist=$(sudo -u postgres -H sh -c "psql postgres -tAc \
            \"SELECT 1 FROM pg_database WHERE datname='Bottius_DB'\"" 2>/dev/null)
        pgsql_auth_type=$(grep -P "^host.*all.*all.*(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2])).*ident$" /var/lib/pgsql/12/data/pg_hba.conf)

    ############################################################################
    # Makes sure that the system user 'bottius' and the home directory
    # '/home/bottius' already exists, and that your working directory is
    # '/home/bottius'.
    # 
    # TL;DR: Makes sure that all necessary (important) services, files,
    # directories, and users exist and are in their proper locations.
    ############################################################################
    #
        # Creates a system user named 'bottius', if it does not already exist,
        # along with a home directory for it
        if ! id -u bottius &>/dev/null; then
            echo "${yellow}System user 'bottius' does not exist${nc}" >&2
            echo "Creating system user 'bottius'..."
            useradd --system -Um -k /dev/null bottius || {
                echo "${red}Failed to create 'bottius'" >&2
                echo "${cyan}System user 'bottius' must exist in order to" \
                    "continue${nc}"
                echo -e "\nExiting..."
                exit 1
            }
            echo "Changing permissions of '/home/bottius'..."
            # Permissions for the home directory need to be changed, else an
            # error will be produced when trying to install the 'node_module'
            chmod 755 "$home"

            move_to_home
            change_ownership
        # Creates bottius's home directory if it does not exist
        elif [[ ! -d $home ]]; then
            echo "${yellow}bottius's home directory does not exist${nc}" >&2
            echo "Creating '$home'..."
            mkdir "$home"

            move_to_home
            change_ownership
        fi

        if [[ $PWD != "/home/bottius" ]]; then
            move_to_home
            change_ownership
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

    ############################################################################
    # User options for installing perquisites, downloading Bottius, and
    # starting Bottius in different run modes
    ############################################################################
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
                    download_bot
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
        elif (! hash psql || ! hash node || ! hash npm || [[ ! $database_exist ||
                ! $database_user_exist || ! -f out/botconfig.json || ! -f \
                ormconfig.json || ! -d node_modules ]] ||
                ! $pgsql_auth_type) &>/dev/null; then
            echo "${cyan}Some or all of the prerequisites are not installed." \
                "Until they are all installed and set up, all options to run" \
                "Bottius have been disabled.${nc}"
            echo "1. Download/update Bottius"

            if ! hash psql &>/dev/null; then
                echo "2. Install Postgres ${red}(Not installed)${nc}"
            else
                echo "2. Install Postgres ${green}(Already installed)${nc}"
            fi
            
            if (! hash node || ! hash npm) &>/dev/null; then
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
                echo "5. Set up botconfig.json ${green}(Already setup)${nc}"
            fi

            if [[ ! -f ormconfig.json ]]; then
                echo "6. Set up ormconfig.json ${red}(Not setup)${nc}"
            else
                echo "6. Set up ormconfig.json ${green}(Already setup)${nc}"
            fi

            if [[ ! -d out/ ]]; then
                echo "7. Compile code ${red}(Not compiled)${nc}"
            else
                echo "7. Compile code ${green}(Already compiled)${nc}"
            fi
            
            if [[ $database_exist && $database_user_exist && ! $pgsql_auth_type ]]; then 
                echo "8. Configure Postgres database ${green}(Already setup)${nc}"
            elif [[ $database_exist || $database_user_exist || ! $pgsql_auth_type ]]; then
                echo "8. Configure Postgres database ${yellow}(Partially setup)${nc}"
            else
                echo "8. Configure Postgres database ${red}(Not setup)${nc}"
            fi

            echo "9. Stop and exit script"
            read option
            case "$option" in
                1)
                    download_bot
                    clear
                    ;;
                2)
                    ./installers/CentOS-RHEL/postgres-installer.sh
                    clear
                    ;;
                3)
                    export option
                    ./installers/CentOS-RHEL/nodejs-installer.sh
                    clear
                    ;;
                4)
                    export option
                    ./installers/CentOS-RHEL/nodejs-installer.sh
                    clear
                    ;;
                5)
                    export bottius_service_status
                    ./installers/Linux_Universal/setup/bot-config-setup.sh
                    clear
                    ;;
                6)
                    export bottius_service_status
                    ./installers/Linux_Universal/setup/orm-config-setup.sh
                    clear
                    ;;
                7)
                    clear
                    if [[ ! -f source/botconfig.json ]]; then
                        echo "${yellow}'botconfig.json' doesn't exist. Before" \
                            "compiling the code, create 'botconfig.json' via" \
                            "option 5 on the installer menu.${nc}"
                        continue
                    fi

                    printf "We will now compile the bottius code. "
                    read -p "Press [Enter] to continue."
                    echo "Compiling code..."
                    tsc || {
                        echo "${red}Failed to compile code${nc}" >&2
                        read -p "Press [Enter] to return to the installer menu"
                        clear
                        continue
                    }

                    echo -e "\n${cyan}If there are any errors, resolve whatever issue is" \
                        "causing them, then attempt to compile the code again\n${nc}"

                    read -p "Press [Enter] to return to the installer menu"
                    clear
                    ;;
                8)
                    clear
                    if ! hash psql &>/dev/null; then
                        echo "${yellow}Postgres is not installed. Postgres" \
                            "must be installed before it can be configured.${nc}"
                        continue
                    fi
                    printf "We will now configure the Postgres database. "
                    read -p "Press [Enter] to continue."

                    echo "Creating database user 'Bottius'..."
                    if [[ $database_exist ]]; then
                        echo "${cyan}Role 'Bottius' already exists${nc}"
                    else
                        sudo -u postgres -H sh -c "createuser -P Bottius" || {
                            echo "${red}Failed to create the database user" \
                                "'Bottius'${nc}" >&2
                            read -p "Press [Enter] to return to the installer menu"
                            clear
                            continue
                        }
                    fi

                    echo "Creating database for Bottius..."
                    if [[ $database_user_exist ]]; then
                        echo "${cyan}Database 'Bottius_DB' already exist${nc}"
                    else
                        sudo -u postgres -H sh -c "createdb -O Bottius Bottius_DB" || {
                            echo "${red}Failed to create a database for Bottius${nc}" >&2
                            create_failed=true
                        }
                    fi

                    echo "Modifying authentication method from ident to md5..."
                    if [[ $pgsql_auth_type ]]; then 
                        sed -i.bak 's/ident$/md5/g' /var/lib/pgsql/12/data/pg_hba.conf
                        
                        if [[ $(systemctl is-active postgresql-12) ]]; then
                            echo "Restarting postgresql-12..."
                            systemctl restart postgresql-12 || {
                                echo "${red}Failed to restart postgresql-12" >&2
                                echo "${cyan}You will need to manually restart it" \
                                    "to apply any changes to the config files"
                            }
                        fi
                    else 
                        echo "Authentication already uses method md5"
                    fi

                    if [[ ! $create_failed ]]; then
                        echo -e "\n${green}Postgres database has been configured${nc}"
                    else
                        echo -e "\n"
                    fi
                    read -p "Press [Enter] to return to the installer menu"
                    clear
                    ;;
                9)
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
            if [[ $bottius_service_startup = 0 && -f $bottius_service &&
                    $bottius_service_status = "active" ]]; then
                echo "1. Download/update Bottius"
                echo "2. Run Bottius in the background"
                echo "3. Run Bottius in the background with auto-restart${green}" \
                    "(Running in this mode)${nc}"
            elif [[ $bottius_service_startup = 0 && -f $bottius_service &&
                    $bottius_service_status != "active" ]]; then
                echo "1. Download/update Bottius"
                echo "2. Run Bottius in the background"
                echo "3. Run Bottius in the background with auto-restart${yellow}" \
                    "(Setup to use this mode)${nc}"
            elif [[ -f $bottius_service && $bottius_service_status = "active" ]]; then
                echo "1. Download/update Bottius"
                echo "2. Run Bottius in the background ${green}(Running in" \
                    "this mode)${nc}"
                echo "3. Run Bottius in the background with auto-restart"
            elif [[ -f $bottius_service && $bottius_service_status != "active" ]]; then
                echo "1. Download/update Bottius"
                echo "2. Run Bottius in the background ${yellow}(Setup to" \
                    "use this mode)${nc}"
                echo "3. Run Bottius in the background with auto-restart"
            # If this occurs, that means that 'bottius.service' has not been
            # created for some reason
            else
                echo "1. Download/update Bottius"
                echo "2. Run Bottius in the background"
                echo "3. Run Bottius in the background with auto-restart"
            fi

            echo "4. Stop Bottius"
            echo "5. Advanced options"
            echo "6. Stop and exit script"
            read option
            case "$option" in
                1)
                    download_bot
                    clear
                    ;;
                2)
                    export home
                    export bottius_service_status
                    export bottius_service_startup
                    ./installers/Linux_Universal/b-start-modes/run-in-background.sh
                    clear
                    ;;
                3)
                    export home
                    export bottius_service_status
                    export bottius_service_startup
                    ./installers/Linux_Universal/b-start-modes/run-in-background-auto-restart.sh
                    clear
                    ;;
                4)
                    export bottius_service_status
                    ./installers/Linux_Universal/b-stop.sh
                    clear
                    ;;
                5)
                    ./installers/Linux_Universal/postgres-open-close.sh
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
