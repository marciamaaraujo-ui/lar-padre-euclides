/* ===================================================== */
/* SISTEMA NUTRICIONAL ILPI */
/* ===================================================== */

/* ================= UTILITÁRIOS ================= */

function getEl(id){
    return document.getElementById(id);
}

function getVal(id){
    const el = getEl(id);
    return el ? el.value : "";
}

function getNum(id){
    const el = getEl(id);
    if(!el) return 0;
    return parseFloat((el.value || "").replace(",", ".")) || 0;
}

/* ================= BANCO DE DADOS ================= */

function obterBanco(){
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco){
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

function criarPacienteSeNaoExistir(nome){

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {
            criadoEm: new Date().toISOString(),
            dadosBasicos: {},
            foto: "",
            mna: {},
            antropometria: {},
            nrs: {},
            sarcopenia: {},
            icn: {},
            evolucao: []
        };

        salvarBanco(banco);
    }

    return banco;
}

/* ================= PACIENTE ATIVO ================= */

function definirPacienteAtivo(nome){
    localStorage.setItem("pacienteAtivoILPI", nome);
}

function obterPacienteAtivo(){
    return localStorage.getItem("pacienteAtivoILPI");
}

/* ================= SALVAR REGISTRO ================= */

function salvarRegistro(){

    const nomeInput = getVal("nome").trim().toUpperCase();

    if(!nomeInput){
        alert("Digite o nome do residente.");
        return;
    }

    // Criar paciente se não existir
    criarPacienteSeNaoExistir(nomeInput);

    const banco = obterBanco();

    // Salvar dados básicos
    banco[nomeInput].dadosBasicos = {
        dataNascimento: getVal("dataNascimento"),
        idade: getVal("idade"),
        dataAdmissao: getVal("dataAdmissao"),
        alergias: getVal("alergias"),
        convenio: getVal("convenio"),
        hygia: getVal("hygia"),
        diagnosticos: getVal("diagnosticos"),
        protese: getVal("protese")
    };

    salvarBanco(banco);

    // Definir como paciente ativo
    definirPacienteAtivo(nomeInput);

    atualizarPacienteAtivoNavbar();

    alert("Registro salvo com sucesso.");
}
function atualizarPacienteAtivoNavbar(){

    const nome = obterPacienteAtivo();
    const banco = obterBanco();
    const info = getEl("pacienteAtivoInfo");

    if(!info) return;

    if(!nome || !banco[nome]){
        info.innerText = "👤 Nenhum paciente selecionado";
        return;
    }

    info.innerText = `👤 ${nome}`;
}

/* ================= MNA ================= */

function calcularMNA(){

    let total = 0;

    const campos = [
        "mnaA","mnaB","mnaC","mnaD","mnaE",
        "mnaG","mnaH","mnaI","mnaJ","mnaK",
        "mnaL","mnaM","mnaN","mnaO","mnaP",
        "mnaQ","mnaR"
    ];

    campos.forEach(id => {
        const valor = parseFloat(getVal(id));
        if(!isNaN(valor)){
            total += valor;
        }
    });

    const campoTotal = getEl("mnaTotal");
    if(campoTotal){
        campoTotal.value = total.toFixed(1);
    }

    const campoClass = getEl("classMNA");
    if(campoClass){
        let classificacao = "Estado Nutricional Normal";

        if(total < 17) classificacao = "Desnutrido";
        else if(total < 24) classificacao = "Risco de Desnutrição";

        campoClass.value = classificacao;
    }
}

/* ================= SALVAR MNA ================= */

function salvarMNA(){

    const nome = obterPacienteAtivo();

    if(!nome){
        alert("Nenhum paciente ativo.");
        return;
    }

    const banco = obterBanco();

    if(!banco[nome]){
        alert("Paciente não encontrado.");
        return;
    }

    banco[nome].mna = {
        data: new Date().toISOString(),
        total: getVal("mnaTotal"),
        classificacao: getVal("classMNA")
    };

    salvarBanco(banco);

    alert("MNA salva com sucesso.");
}
/* ================= LOAD ================= */

document.addEventListener("DOMContentLoaded", function(){

    atualizarPacienteAtivoNavbar();

    const nome = obterPacienteAtivo();
    const banco = obterBanco();

    /* ================= CARREGAR DADOS BÁSICOS ================= */

    if(nome && banco[nome] && banco[nome].dadosBasicos){

        const dados = banco[nome].dadosBasicos;

        if(getEl("nome")) getEl("nome").value = nome;
        if(getEl("dataNascimento")) getEl("dataNascimento").value = dados.dataNascimento || "";
        if(getEl("idade")) getEl("idade").value = dados.idade || "";
        if(getEl("dataAdmissao")) getEl("dataAdmissao").value = dados.dataAdmissao || "";
        if(getEl("alergias")) getEl("alergias").value = dados.alergias || "";
        if(getEl("convenio")) getEl("convenio").value = dados.convenio || "";
        if(getEl("hygia")) getEl("hygia").value = dados.hygia || "";
        if(getEl("diagnosticos")) getEl("diagnosticos").value = dados.diagnosticos || "";
        if(getEl("protese")) getEl("protese").value = dados.protese || "";
    }

    /* ================= CARREGAR MNA ================= */

    if(nome && banco[nome] && banco[nome].mna){

        const mna = banco[nome].mna;

        if(getEl("mnaTotal")) getEl("mnaTotal").value = mna.total || "";
        if(getEl("classMNA")) getEl("classMNA").value = mna.classificacao || "";
    }

    /* ================= EVENTOS MNA ================= */

    const selects = document.querySelectorAll("[id^='mna']");

    selects.forEach(select => {
        select.addEventListener("change", calcularMNA);
    });

});
