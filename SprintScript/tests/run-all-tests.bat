@echo off
echo ========================================
echo    SPRINTSCRIPT - SUITE DE TESTES
echo ========================================
echo.

REM ============ TESTES ESSENCIAIS ============
echo [1/7] Executando testes basicos...
node test-basic-functionality.js
echo.

echo [2/7] Executando testes avancados...
node test-extension-advanced.js
echo.

echo [3/7] Executando testes de regressao...
node test-regression.js
echo.

echo [4/7] Executando testes de performance...
node test-performance.js
echo.

echo [5/7] Executando testes de compatibilidade...
node test-compatibility.js
echo.

REM ============ TESTES DIAGNOSTICOS ============
echo [6/7] Executando diagnostico de carregamento...
node test-extension-loading.js
echo.

echo [7/7] Executando diagnostico de tooltip...
node test-tooltip-issues.js
echo.

REM ============ TESTES OPCIONAIS (comentados) ============
REM Descomente se quiser executar testes especificos:

REM echo [EXTRA] Testando comportamento de tooltip...
REM node test-tooltip-behavior.js
REM echo.

REM echo [EXTRA] Testando persistencia de tooltip...
REM node test-tooltip-persistence.js
REM echo.

REM echo [EXTRA] Debug detalhado de tooltip...
REM node test-tooltip-persistence-debug.js
REM echo.

echo ========================================
echo          RESULTADOS FINAIS
echo ========================================
echo.
echo ✅ TESTES ESSENCIAIS:
echo    - Funcionalidade basica
echo    - Casos avancados  
echo    - Regressao de bugs
echo    - Performance
echo    - Compatibilidade
echo.
echo 🔧 TESTES DIAGNOSTICOS:
echo    - Carregamento da extensao
echo    - Problemas de interface
echo.
echo 💡 Para testes especificos de tooltip,
echo    descomente as linhas no arquivo .bat
echo.

echo ========================================
echo          TESTES CONCLUIDOS
echo ========================================
pause