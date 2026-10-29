# PR #8 — preparação do emulador Android

Head consultado: `9d449323efc0c7689dbbf5812f0e61b8e99789ff`.
[CI aprovado](https://github.com/infovida/info-vida/actions/runs/40620618917).
[E2E analisado](https://github.com/infovida/info-vida/actions/runs/40620618915),
job `122593826554`.

## Evidência

Instalação, compilação release do APK, instalação do Maestro e configuração KVM
passaram. A criação do AVD falhou antes de iniciar o emulador ou testar o app:

```text
This version only understands SDK XML versions up to 3 but an SDK XML file of version 4 was encountered.
Do you wish to create a custom hardware profile? [no] Cannot invoke "java.util.Map.values()" because "hwMap" is null
```

O erro de conexão à porta 5554 ocorreu na limpeza posterior: nenhum emulador
estava disponível para encerrar. Não é a causa primária. A pasta Maestro não
existia porque o script que a criaria só executaria após o boot.

## Correção local proposta

- Configurar ferramentas Android antes do build usando
  `android-actions/setup-android@v4`, com command-line tools build `15859902`
  (22.0), alinhando sdkmanager/avdmanager no PATH em vez de depender da versão
  implícita do runner.
- Informar perfil `pixel_2` ao android-emulator-runner, evitando a criação com
  perfil de hardware não especificado. API 35, x86_64 e KVM mantidos.
- Gravar caminhos/versão das ferramentas e lista de perfis antes da criação do
  emulador, preservando diagnósticos mesmo se o boot não for alcançado.

O ajuste responde à incompatibilidade observada; sua eficácia ainda depende de
nova execução remota. A leitura do log não comprova que essa combinação é a
única causa possível de `hwMap` nulo. Nenhum check foi desativado.

Referências: [setup-android](https://github.com/android-actions/setup-android#sdk-version-selection)
e [perfis do emulator runner](https://github.com/ReactiveCircus/android-emulator-runner#configurations).

## Validação

YAML do workflow e sintaxe bash dos passos locais conferidos; `git diff --check`
aprovado. Nenhuma alteração no código do app, commit, push ou disparo remoto.
Não foi executado emulador Android localmente. Requer publicar a alteração na
mesma branch e conferir criação do AVD, boot, instalação do APK e resultado Maestro.
O sucesso do build anterior não significa aprovação do smoke.
