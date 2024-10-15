
!macro customInstall
  #MessageBox MB_OK "Custom Install"
  ${ifNot} ${isUpdated}
  #MessageBox MB_OK "Custom New Install"

  MessageBox MB_YESNO "Install reference Flows into your Flow Database? Merge data from $INSTDIR\services\totaljs-flow\database\database-stix.json to $APPDATA\Roaming\TypeRefinery\services\totaljs-flow\database\database.json." IDYES true IDNO false
  true:
    ExpandEnvStrings $R0 '%COMSPEC%'
    #MessageBox MB_OK "Run script to copy reference flows to your database."
    ExecWait '$R0 /c "$INSTDIR\resources\install\merge_json.cmd" "$INSTDIR\services\totaljs-flow\database\database_stix.json" "$APPDATA\Roaming\TypeRefinery\services\totaljs-flow\database\database.json"'
    Goto next
  false:
  next:

  #MessageBox MB_OK "Custom New Install Done"
  ${endIf}
!macroend
