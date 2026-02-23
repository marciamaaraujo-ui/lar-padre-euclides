/* ============================= */
/* BANCO DE DADOS LOCAL */
/* ============================= */

function obterBanco() {
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco) {
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

function getEl(id) {
    return document.getElementById(id);
}

function getNum(id) {
    const el = getEl(id);
    if (!el) return 0;
    return parseFloat((el.value || "").replace(",", ".")) || 0;
}

function getVal(id) {
    const el = getEl(id);
    return el ? el.value : "";
}

/* ============================= */
/* CÁLCULOS PRINCIPAIS */
/* ============================= */

function calcularIdadeAutomatica() {

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
function calcularTudo() {

    const peso = getNum("peso");
    const altura = getNum("altura");
    const pesoHab = getNum("pesoHab");
    const idade = parseInt(getVal("idade")) || 0;

    /* ================= IMC ================= */

    let imc = 0;

    if (peso > 0 && altura > 0) {
        imc = peso / (altura * altura);

        if (getEl("imc")) {
            getEl("imc").value = imc.toFixed(2);
        }

        let classIMC = "Sobrepeso";

        if (imc < 22) classIMC = "Baixo Peso";
        else if (imc <= 27) classIMC = "Eutrofia";

        if (getEl("classImc")) {
            getEl("classImc").value = classIMC;
        }
    }

    /* ================= PERDA DE PESO ================= */

    let perda = 0;

    if (peso > 0 && pesoHab > 0) {
        perda = ((pesoHab - peso) / pesoHab) * 100;

        if (getEl("perda")) {
            getEl("perda").value = perda.toFixed(1) + "%";
        }
    }

    /* ================= MNA ================= */

    const mnaTri = getNum("mnaTriagem");
    const mnaGlob = getNum("mnaGlobal");
    const mnaTotal = mnaTri + mnaGlob;

    if (getEl("mnaTotal")) {
        getEl("mnaTotal").value = mnaTotal;
    }

    /* ================= NRS ================= */

    const nrsNutri = getNum("nrsNutri");
    const nrsGrav = getNum("nrsGrav");

    let nrsTotal = nrsNutri + nrsGrav;

    if (idade >= 70) {
        nrsTotal += 1;
    }

    if (getEl("nrsTotal")) {
        getEl("nrsTotal").value = nrsTotal;
    }

    /* ================= ICN ================= */

    const icnData = calcularICN(mnaTotal, nrsTotal, imc);

    if (getEl("icn")) {
        getEl("icn").value = icnData.icn;
    }

    if (getEl("classICN")) {
        getEl("classICN").value = icnData.classificacao;
    }

    gerarPES(icnData.classificacao);
}

/* ============================= */
/* CÁLCULO DO ICN */
/* ============================= */

function calcularICN(mna, nrs, imc) {

    let scoreIMC = 0;

    if (imc < 22) scoreIMC = 0;
    else if (imc <= 27) scoreIMC = 1;
    else scoreIMC = 2;

    const icn = (mna * 0.4) + (nrs * 0.4) + (scoreIMC * 2);

    let classificacao = "Baixo Risco";

    if (icn < 8) classificacao = "Alto Risco Clínico";
    else if (icn < 13) classificacao = "Risco Moderado";

    return {
        icn: icn.toFixed(2),
        classificacao
    };
}

/* ============================= */
/* DIAGNÓSTICO PES */
/* ============================= */

function gerarPES(classificacao) {

    let texto = "";

    if (classificacao === "Alto Risco Clínico") {
        texto = "Desnutrição relacionada à ingestão insuficiente evidenciada por risco clínico elevado.";
    }
    else if (classificacao === "Risco Moderado") {
        texto = "Risco nutricional relacionado à condição clínica atual.";
    }
    else {
        texto = "Estado nutricional preservado.";
    }

    if (getEl("parecer")) {
        getEl("parecer").value = texto;
    }
}

/* ============================= */
/* SALVAR REGISTRO */
/* ============================= */

function salvarRegistro() {

    const nomeRaw = getVal("nome");

    if (!nomeRaw.trim()) {
        alert("Nome obrigatório.");
        return;
    }

    const nome = nomeRaw.trim().toUpperCase();
    const data = getVal("data");

    if (!data) {
        alert("Data obrigatória.");
        return;
    }

    const banco = obterBanco();

    if (!banco[nome]) {
        banco[nome] = {
            criadoEm: new Date().toISOString(),
            avaliacoes: []
        };
    }

    const novaAvaliacao = {
        data,
        idade: getVal("idade"),
        peso: getVal("peso"),
        altura: getVal("altura"),
        imc: getVal("imc"),
        classificacaoIMC: getVal("classImc"),
        perdaPeso: getVal("perda"),
        mnaTotal: getVal("mnaTotal"),
        nrsTotal: getVal("nrsTotal"),
        icn: getVal("icn"),
        classificacaoICN: getVal("classICN"),
        parecerPES: getVal("parecer"),
        registradoEm: new Date().toISOString()
    };

    banco[nome].avaliacoes.push(novaAvaliacao);

    salvarBanco(banco);

    alert("Avaliação salva com sucesso!");
}
