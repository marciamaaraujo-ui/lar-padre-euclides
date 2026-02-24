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

/* ================= SALVAR REGISTRO ================= */

function salvarRegistro(){

    const nomeInput = getVal("nome").trim().toUpperCase();

    if(!nomeInput){
        alert("Digite o nome do residente.");
        return;
    }

    criarPacienteSeNaoExistir(nomeInput);

    const banco = obterBanco();

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

    definirPacienteAtivo(nomeInput);
    atualizarPacienteAtivoNavbar();

    alert("Registro salvo com sucesso.");
}

/* ================= IMC ================= */

function calcularIMC(){

    const peso = getNum("peso");
    const altura = getNum("altura");

    if(peso <= 0 || altura <= 0) return;

    const imc = peso / (altura * altura);

    if(getEl("imc")) getEl("imc").value = imc.toFixed(2);

    let classificacao = "";

    if(imc < 18.5) classificacao = "Baixo Peso";
    else if(imc < 25) classificacao = "Eutrofia";
    else if(imc < 30) classificacao = "Sobrepeso";
    else classificacao = "Obesidade";

    if(getEl("classImc")) getEl("classImc").value = classificacao;

    return imc;
}

/* ================= SARCOPENIA ================= */

function calcularSarcopenia(){

    const braco = getNum("circBraco");
    const pant = getNum("circPanturrilha");

    let classificacao = "Sem risco";

    if(braco > 0 && braco < 22) classificacao = "Risco Sarcopênico";
    if(pant > 0 && pant < 31) classificacao = "Risco Sarcopênico";

    if(getEl("scoreSarcopenia"))
        getEl("scoreSarcopenia").value = classificacao;

    return classificacao;
}

/* ================= NRS ================= */

function calcularNRS(){

    const nutri = getNum("nrsNutri");
    const grav = getNum("nrsGrav");
    const idade = getNum("idade");

    let adicionalIdade = idade >= 70 ? 1 : 0;

    const total = nutri + grav + adicionalIdade;

    if(getEl("nrsIdade")) getEl("nrsIdade").value = adicionalIdade;
    if(getEl("nrsTotal")) getEl("nrsTotal").value = total;

    let classificacao = total >= 3 ? "Risco Nutricional" : "Sem Risco";

    if(getEl("classNRS")) getEl("classNRS").value = classificacao;

    return total;
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
        if(!isNaN(valor)) total += valor;
    });

    if(getEl("mnaTotal")) getEl("mnaTotal").value = total.toFixed(1);

    let classificacao = "Estado Nutricional Normal";
    if(total < 17) classificacao = "Desnutrido";
    else if(total < 24) classificacao = "Risco de Desnutrição";

    if(getEl("classMNA")) getEl("classMNA").value = classificacao;
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

/* ================= ICN ================= */

function calcularICN(){

    const nome = obterPacienteAtivo();
    const banco = obterBanco();

    if(!nome || !banco[nome]) return;

    let score = 0;

    const mna = parseFloat(banco[nome].mna?.total) || 0;
    if(mna < 17) score += 3;
    else if(mna < 24) score += 2;

    const nrs = getNum("nrsTotal");
    if(nrs >= 3) score += 2;

    const sarc = getVal("scoreSarcopenia");
    if(sarc.includes("Risco")) score += 1;

    let classificacao = "Baixo Risco";
    if(score >= 4) classificacao = "Alto Risco";
    else if(score >= 2) classificacao = "Risco Moderado";

    if(getEl("icn")) getEl("icn").value = score;
    if(getEl("classICN")) getEl("classICN").value = classificacao;

    banco[nome].icn = {
        score: score,
        classificacao: classificacao,
        data: new Date().toISOString()
    };

    salvarBanco(banco);

    return score;
}

/* ================= LOAD ================= */

document.addEventListener("DOMContentLoaded", function(){

    atualizarPacienteAtivoNavbar();

    const nome = obterPacienteAtivo();
    const banco = obterBanco();

    /* ===== CARREGAR DADOS ===== */

    if(nome && banco[nome]?.dadosBasicos){
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

    if(nome && banco[nome]?.mna){
        const mna = banco[nome].mna;
        if(getEl("mnaTotal")) getEl("mnaTotal").value = mna.total || "";
        if(getEl("classMNA")) getEl("classMNA").value = mna.classificacao || "";
    }

    /* ===== RECALCULAR ===== */

    calcularIMC();
    calcularSarcopenia();
    calcularNRS();
    calcularICN();

    /* ===== EVENTOS ===== */

    ["peso","altura"].forEach(id=>{
        const el = getEl(id);
        if(el){
            el.addEventListener("input", ()=>{
                calcularIMC();
                calcularICN();
            });
        }
    });

    ["circBraco","circPanturrilha"].forEach(id=>{
        const el = getEl(id);
        if(el){
            el.addEventListener("input", ()=>{
                calcularSarcopenia();
                calcularICN();
            });
        }
    });

    ["nrsNutri","nrsGrav"].forEach(id=>{
        const el = getEl(id);
        if(el){
            el.addEventListener("change", ()=>{
                calcularNRS();
                calcularICN();
            });
        }
    });

    const selects = document.querySelectorAll("[id^='mna']");
    selects.forEach(select => {
        select.addEventListener("change", ()=>{
            calcularMNA();
            calcularICN();
        });
    });

});
