# New Service Analysis Status

This tracker is now the completed analysis index for every board card labeled `feature/services`.

## Outcome Summary

The services fall into three implementation groups:

- `Packaged static web service`
  - Attack Navigator
  - Atlas Navigator
  - Mitre D3FEND
  - Attack-Flow
  - capa Web App
- `Docker-orchestrated stack or container service`
  - Complete Attack Workbench
  - Mitre Caldera
- `Utility or external integration`
  - CAPEv2
  - CISA CSET
  - NSA Ghidra plus Webswing

## Completed Analysis Docs

- [Issue 44 - Attack Navigator](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-44-ATTACK-NAVIGATOR-TODO.md)
- [Issue 45 - Atlas Navigator](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-45-ATLAS-NAVIGATOR-TODO.md)
- [Issue 46 - Complete Attack Workbench](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-46-ATTACK-WORKBENCH-TODO.md)
- [Issue 48 - Mitre D3FEND](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-48-D3FEND-TODO.md)
- [Issue 49 - Attack-Flow](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-49-ATTACK-FLOW-TODO.md)
- [Issue 50 - Mitre Caldera](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-50-CALDERA-TODO.md)
- [Issue 51 - capa Web App](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-51-CAPA-WEB-APP-TODO.md)
- [Issue 52 - CAPEv2](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-52-CAPEV2-TODO.md)
- [Issue 53 - NSA Ghidra](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-53-GHIDRA-TODO.md)
- [Issue 54 - CISA CSET](d:/projects/typerefinery-ai/typerefinery/docs/ISSUE-54-CSET-TODO.md)

## Decisions

- Use the repo’s normal `service.json` pattern only for services that are genuinely local web services or can be cleanly fronted as one.
- Use `setuparchive` plus split `7z` packaging only for services where TypeRefinery can ship a bounded runtime payload.
- Use Docker orchestration when the upstream project is officially Docker-first and the repo would otherwise need to reproduce a large upstream deployment stack.
- Use a utility-service pattern when the install flow is local, heavyweight, or needs a preparation step before another service can expose the UI.
- Do not force VM sandboxes or heavyweight Windows installers into the same service pattern as lightweight web apps.

## Next Implementation Order

1. Attack Navigator
2. Atlas Navigator
3. Mitre D3FEND
4. Attack-Flow
5. capa Web App
6. Complete Attack Workbench
7. Mitre Caldera

The remaining two still need issue-scope correction or a separate integration pattern before implementation starts:

- CAPEv2
- CISA CSET
