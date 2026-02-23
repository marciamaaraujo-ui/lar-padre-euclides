/* ===================================================== */
/* SISTEMA NUTRICIONAL ILPI – VERSÃO DEFINITIVA */
/* ===================================================== */


/* ================= UTILITÁRIOS ================= */

function getEl(id) {
    return document.getElementById(id);
}

function getVal(id) {
    const el = getEl(id);
    return el ? el.value : "";
}

function getNum(id) {
    const el = getEl(id);
    if (!el) return 0;
    return parseFloat((el.value || "").replace(",", ".")) || 0;
}


/* ================= IDADE AUTOMÁTICA ================= */

function calcularIdade() {

    const dataNasc = getVal("dataNascimento");
    if (!dataNasc) return 0;

    const nascimento = new Date(dataNasc);
    const hoje = new Date();

    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();

    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }

    if (getEl("idade")) {
        getEl("idade").value = idade;
    }

    return idade;
}


/* ================= ANTROPOMETRIA ================= */

function calcularAntropometria() {

    const peso = getNum("peso");
    const altura = getNum("altura");
    const pesoHab = getNum("pesoHab");

    let imc = 0;

    if (peso > 0 && altura > 0) {
        imc = peso / (altura * altura);

        if (getEl("imc")) getEl("imc").value = imc.toFixed(2);

        let classIMC = "Sobrepeso";
        if (imc < 22) classIMC = "Baixo Peso";
        else if (imc <= 27) classIMC = "Eutrofia";

        if (getEl("classImc")) getEl("classImc").value = classIMC;
    }

    if (peso > 0 && pesoHab > 0 && getEl("perda")) {
        const perda = ((pesoHab - peso) / pesoHab) * 100;
        getEl("perda").value = perda.toFixed(1) + "%";
    }

    return imc;
}


/* ================= MNA COMPLETO ================= */

function calcularMNA(imc) {

    let total = 0;

    // Itens A–E
    total += getNum("mnaA");
    total += getNum("mnaB");
    total += getNum("mnaC");
    total += getNum("mnaD");
    total += getNum("mnaE");

    // F – IMC automático
    let scoreIMC = 0;

    if (imc < 19) scoreIMC = 0;
    else if (imc < 21) scoreIMC = 1;
    else if (imc < 23) scoreIMC = 2;
    else scoreIMC = 3;

    total += scoreIMC;

    if (getEl("mnaF")) getEl("mnaF").value = scoreIMC;

    // Itens G–R
    total += getNum("mnaG");
    total += getNum("mnaH");
    total += getNum("mnaI");
    total += getNum("mnaJ");
    total += getNum("mnaK");
    total += getNum("mnaL");
    total += getNum("mnaM");
    total += getNum("mnaN");
    total += getNum("mnaO");
    total += getNum("mnaP");
    total += getNum("mnaQ");
    total += getNum("mnaR");

    if (getEl("mnaTotal")) {
        getEl("mnaTotal").value = total.toFixed(1);
    }

    if (getEl("classMNA")) {
        let classif = "Estado Nutricional Normal";
        if (total < 17) classif = "Desnutrido";
        else if (total < 24) classif = "Risco de Desnutrição";

        getEl("classMNA").value = classif;
    }

    return total;
}


/* ================= NRS 2002 ================= */

function calcularNRS(imc, idade) {

    let nutricao = getNum("nrsNutri");      // 0–3
    let gravidade = getNum("nrsGrav");      // 0–3

    let total = nutricao + gravidade;

    if (idade >= 70) {
        total += 1;
        if (getEl("nrsIdade")) getEl("nrsIdade").value = "+1";
    }

    if (getEl("nrsTotal")) getEl("nrsTotal").value = total;

    if (getEl("classNRS")) {
        getEl("classNRS").value = total >= 3 ? "Iniciar suporte nutricional" : "Sem indicação imediata";
    }

    return total;
}


/* ================= ICN ================= */

function calcularICN(mna, nrs, imc) {

    let scoreIMC = 0;
    if (imc < 22) scoreIMC = 0;
    else if (imc <= 27) scoreIMC = 1;
    else scoreIMC = 2;

    const icn = (mna * 0.4) + (nrs * 0.4) + (scoreIMC * 2);

    let classificacao = "Baixo Risco";
    if (icn < 8) classificacao = "Alto Risco Clínico";
    else if (icn < 13) classificacao = "Risco Moderado";

    if (getEl("icn")) getEl("icn").value = icn.toFixed(2);
    if (getEl("classICN")) getEl("classICN").value = classificacao;

    return classificacao;
}


/* ================= PES ================= */

function gerarPES(classificacao) {

    if (!getEl("parecer")) return;

    let texto = "Estado nutricional preservado.";

    if (classificacao === "Alto Risco Clínico") {
        texto = "Desnutrição relacionada à ingestão insuficiente evidenciada por risco clínico elevado.";
    }
    else if (classificacao === "Risco Moderado") {
        texto = "Risco nutricional relacionado à condição clínica atual.";
    }

    getEl("parecer").value = texto;
}


/* ================= ENGINE PRINCIPAL ================= */

function calcularTudo() {

    const idade = calcularIdade();
    const imc = calcularAntropometria();
    const mna = calcularMNA(imc);
    const nrs = calcularNRS(imc, idade);
    const classificacao = calcularICN(mna, nrs, imc);

    gerarPES(classificacao);
}


/* ================= BANCO LOCAL ================= */

function obterBanco() {
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco) {
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

function salvarRegistro() {

    const nome = getVal("nome").trim().toUpperCase();
    if (!nome) {
        alert("Nome obrigatório.");
        return;
    }

    const banco = obterBanco();

    if (!banco[nome]) {
        banco[nome] = {
            criadoEm: new Date().toISOString(),
            avaliacoes: []
        };
    }

    const nova = {
        data: new Date().toISOString(),
        idade: getVal("idade"),
        imc: getVal("imc"),
        mna: getVal("mnaTotal"),
        nrs: getVal("nrsTotal"),
        icn: getVal("icn"),
        classificacao: getVal("classICN"),
        parecer: getVal("parecer")
    };

    banco[nome].avaliacoes.push(nova);
    salvarBanco(banco);

    alert("Avaliação salva com sucesso.");
}
