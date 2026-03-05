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

/* ================= SALVAR REGISTRO UNIFICADO ================= */

function salvarRegistro() {
    // 1. Validação de dados antes de começar a animação
    const nomeInput = getVal("nome").trim().toUpperCase();

    if (!nomeInput) {
        alert("⚠️ Digite o nome do residente antes de salvar.");
        return;
    }

    // 2. Iniciar efeito visual no botão
    const btn = document.querySelector('.btn-navbar');
    const originalText = btn.innerHTML;

    btn.innerHTML = "⏳ Salvando...";
    btn.style.background = "#f39c12"; 
    btn.disabled = true;

    // 3. Lógica Real de Salvamento (Executa imediatamente)
    criarPacienteSeNaoExistir(nomeInput);
    const banco = obterBanco();

    banco[nomeInput].dadosBasicos = {
        dataNascimento: getVal("dataNascimento"),
        idade: getVal("idade"),
        dataAdmissao: getVal("dataAdmissao"),
        alergias: getVal("alergias"),
        convenio: getVal("convenio"),        hygia: getVal("hygia"),
        diagnosticos: getVal("diagnosticos"),
        protese: getVal("protese")
    };

    salvarBanco(banco);
    definirPacienteAtivo(nomeInput);
    atualizarPacienteAtivoNavbar();

    // 4. Finalizar animação após um pequeno delay para o usuário ver
    setTimeout(() => {
        btn.innerHTML = "✅ Salvo!";
        btn.style.background = "#27ae60"; 

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = ""; 
            btn.disabled = false;
        }, 2000);

        console.log("Dados salvos com sucesso no Lar Padre Euclides!");
    }, 1000);
}

/* ================= IMC ================= */

function calcularIMC(){

    const peso = getNum("peso");
    const altura = getNum("altura");
    const idade = getNum("idade");

    if(peso <= 0 || altura <= 0) return;

    const imc = peso / (altura * altura);

    const campoIMC = getEl("imc");
    const campoClass = getEl("classImc");

    if(campoIMC) campoIMC.value = imc.toFixed(2);

    let classificacao = "";
    let classeCSS = "";

    /* ===== CLASSIFICAÇÃO POR FAIXA ETÁRIA ===== */

    if(idade >= 60){

        // LIPSCHITZ – IDOSOS
        if(imc < 22){
            classificacao = "Baixo Peso (Idoso)";
            classeCSS = "imc-baixo";
            
            // 🔴 ALERTA AUTOMÁTICO
            alert("⚠ Atenção: IMC abaixo de 22 em idoso. Avaliar risco nutricional.");
            
        } else if(imc <= 27){
            classificacao = "Eutrofia (Idoso)";
            classeCSS = "imc-normal";
        } else {
            classificacao = "Excesso de Peso (Idoso)";
            classeCSS = "imc-excesso";
        }

    } else {

        // OMS – ADULTOS
        if(imc < 18.5){
            classificacao = "Baixo Peso";
            classeCSS = "imc-baixo";
        }
        else if(imc < 25){
            classificacao = "Eutrofia";
            classeCSS = "imc-normal";
        }
        else if(imc < 30){
            classificacao = "Sobrepeso";
            classeCSS = "imc-excesso";
        }
        else{
            classificacao = "Obesidade";
            classeCSS = "imc-obesidade";
        }
    }

    if(campoClass){
        campoClass.value = classificacao;

        // Remove classes anteriores
        campoClass.classList.remove(
            "imc-baixo",
            "imc-normal",
            "imc-excesso",
            "imc-obesidade"
        );

        // Aplica nova classe
        campoClass.classList.add(classeCSS);
    }

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
    let classeCSS = "icn-baixo";

    if(score >= 4){
        classificacao = "Alto Risco";
        classeCSS = "icn-alto";
    }
    else if(score >= 2){
        classificacao = "Risco Moderado";
        classeCSS = "icn-moderado";
    }

    const campoICN = getEl("icn");
    const campoClass = getEl("classICN");

    if(campoICN) campoICN.value = score;

    if(campoClass){
        campoClass.value = classificacao;

        campoClass.classList.remove(
            "icn-baixo",
            "icn-moderado",
            "icn-alto"
        );

        campoClass.classList.add(classeCSS);
    }

    banco[nome].icn = {
        score: score,
        classificacao: classificacao,
        data: new Date().toISOString()
    };

    salvarBanco(banco);

    /* 🔴 ALERTA AUTOMÁTICO */
    if(score >= 4){
        alert("🚨 ICN indica ALTO RISCO NUTRICIONAL. Avaliar intervenção imediata.");
    }

    atualizarPainelAlertas();

    return score;
}

function atualizarPainelAlertas(){

    const painel = getEl("painelAlertas");
    if(!painel) return;

    const idade = getNum("idade");
    const imc = getNum("imc");
    const icnClass = getVal("classICN");

    let alertas = [];

    /* IMC baixo em idoso */
    if(idade >= 60 && imc > 0 && imc < 22){
        alertas.push("⚠ IMC abaixo de 22 em idoso.");
    }

    /* ICN alto */
    if(icnClass === "Alto Risco"){
        alertas.push("🚨 ICN indica alto risco nutricional.");
    }

    /* NRS */
    if(getNum("nrsTotal") >= 3){
        alertas.push("⚠ NRS ≥ 3 (Risco Nutricional).");
    }

    /* Sarcopenia */
    if(getVal("scoreSarcopenia").includes("Risco")){
        alertas.push("⚠ Risco de sarcopenia identificado.");
    }

    if(alertas.length === 0){
        painel.innerHTML = "<div class='alerta-item'>✔ Nenhum alerta ativo.</div>";
        return;
    }

    painel.innerHTML = alertas
        .map(a => `<div class="alerta-item">${a}</div>`)
        .join("");
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
    /* ===== ATUALIZAR PAINEL ALERTAS ===== */
atualizarPainelAlertas();
});

/* ================= SALVAR COMORBIDADES (CORREÇÃO) ================= */

function salvarComorbidades() {
    const nome = obterPacienteAtivo();
    if (!nome) {
        alert("⚠️ Selecione um residente primeiro!");
        return;
    }

    const banco = obterBanco();
    
    // Lista de todos os IDs de checkboxes que você criou no HTML
    const idsComorbidades = [
        "has", "dislip", "venosa", "arritmia", "cardio", "icc", "trombose", "ivp", "aneurisma",
        "dm1", "dm2", "insulino", "hipot", "obes", "hiperuri",
        "alz", "park", "avc", "depressao", "ansiedade", "epilepsia", "esquiz", "encef", "microangio"
    ];

    // Filtra apenas os IDs que estão marcados (checked)
    const selecionadas = idsComorbidades.filter(id => {
        const el = getEl(id);
        return el && el.checked;
    });

    // Salva no banco de dados do paciente específico
    banco[nome].comorbidades = selecionadas;
    
    // Salva também as observações manuais (opcional)
    banco[nome].detalhesClinicos = {
        controle: document.querySelector("select")?.value || "",
        obs: document.querySelector("textarea")?.value || "",
        cid: document.querySelector("input[type='text']")?.value || ""
    };

    salvarBanco(banco);
    
    // Efeito visual de sucesso no botão
    const btn = document.querySelector('.btn-save');
    if(btn) {
        btn.innerHTML = "✅ Dados Gravados!";
        setTimeout(() => btn.innerHTML = "💾 Salvar", 2000);
    }
    
    console.log("Comorbidades de " + nome + " atualizadas:", selecionadas);
}
