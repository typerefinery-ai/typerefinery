
!macro customInstall
  #MessageBox MB_OK "Custom Install"
  ${ifNot} ${isUpdated}
  #MessageBox MB_OK "Custom New Install"

  ExpandEnvStrings $R0 '%COMSPEC%'
  ExpandEnvStrings $R1 '%APPDATA%'

  MessageBox MB_YESNO "Install reference Flows into your Flow Database?$\n$\nMerge data from $\n$\n$INSTDIR\services\totaljs-flow\database\database-stix.json $\n$\n to $\n$\n $R1\Roaming\TypeRefinery\services\totaljs-flow\database\database.json.$\n$\n" IDYES true IDNO false
  true:
    #MessageBox MB_OK "Run script to copy reference flows to your database."
    ExecWait '$R0 /C .\resources\install\merge_json.cmd  .\services\totaljs-flow\database\database_stix.json ..\..\..\Roaming\TypeRefinery\services\totaljs-flow\database\database.json'
    Goto next
  false:
  next:

  #MessageBox MB_OK "Custom New Install Done"
  ${endIf}
!macroend
