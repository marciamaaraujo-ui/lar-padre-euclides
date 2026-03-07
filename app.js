/* ===================================================== */
/* SISTEMA NUTRICIONAL ILPI - VERSÃO FINAL ESTÁVEL       */
/* ===================================================== */

/* ================= UTILITÁRIOS ================= */

function getEl(id){ return document.getElementById(id); }

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
    try{
        return JSON.parse(localStorage.getItem("bancoILPI")) || {};
    }catch{
        return {};
    }
}

function salvarBanco(banco){
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

/* ================= CRIAR PACIENTE ================= */

function criarPacienteSeNaoExistir(nome){

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {};
        salvarBanco(banco);
    }

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
    const info = getEl("pacienteAtivoInfo");

    if(!info) return;

    info.innerText = nome
        ? `👤 ${nome}`
        : "👤 Nenhum paciente selecionado";

}

/* ================= SALVAR REGISTRO ================= */

function salvarRegistro(){

    const nomeInput = getVal("nome").trim().toUpperCase();

    if(!nomeInput){
        alert("⚠️ Digite o nome do residente!");
        return;
    }

    const btn = document.querySelector(".btn-navbar");
    if(btn) btn.innerHTML = "⏳ Salvando...";

    criarPacienteSeNaoExistir(nomeInput);

    const banco = obterBanco();

    if(!banco[nomeInput])
        banco[nomeInput] = {};

    banco[nomeInput].dadosBasicos = {

        dataNascimento:getVal("dataNascimento"),
        idade:getVal("idade"),
        dataAdmissao:getVal("dataAdmissao"),
        alergias:getVal("alergias"),
        convenio:getVal("convenio"),
        hygia:getVal("hygia"),
        diagnosticos:getVal("diagnosticos"),
        protese:getVal("protese")

    };

    salvarBanco(banco);

    definirPacienteAtivo(nomeInput);
    atualizarPacienteAtivoNavbar();

    if(btn){
        setTimeout(()=>{
            btn.innerHTML="✅ Salvo!";
            setTimeout(()=>{
                btn.innerHTML="💾 Salvar Registro";
            },2000);
        },1000);
    }

}

/* ================= CALCULAR IDADE ================= */

function calcularIdade(){

    const nascimento = getVal("dataNascimento");
    if(!nascimento) return;

    const hoje = new Date();
    const nasc = new Date(nascimento);

    let idade = hoje.getFullYear() - nasc.getFullYear();

    const mes = hoje.getMonth() - nasc.getMonth();

    if(mes < 0 || (mes === 0 && hoje.getDate() < nasc.getDate())){
        idade--;
    }

    if(getEl("idade"))
        getEl("idade").value = idade;

}

/* ================= ESCALA DE KATZ ================= */

function calcularKatz(){

    const campos=[
        "katzBanho",
        "katzVestir",
        "katzHigiene",
        "katzTransferencia",
        "katzContinencia",
        "katzAlimentacao"
    ];

    let total=0;

    campos.forEach(id=>{
        total+=parseInt(getVal(id))||0;
    });

    if(getEl("katzTotal"))
        getEl("katzTotal").value=total;

    let classe="";

    if(total===6)
        classe="Independente para todas as atividades básicas";
    else if(total>=4)
        classe="Dependência parcial";
    else
        classe="Dependência importante";

    if(getEl("katzClassificacao"))
        getEl("katzClassificacao").value=classe;

}

/* ================= IMC ================= */

function calcularIMC(){

    const peso=getNum("peso");
    const altura=getNum("altura");
    const idade=getNum("idade");

    if(peso<=0 || altura<=0 || altura>3){
        if(getEl("imc")) getEl("imc").value="";
        if(getEl("classImc")) getEl("classImc").value="";
        return;
    }

    const imc=peso/(altura*altura);

    if(getEl("imc"))
        getEl("imc").value=imc.toFixed(2);

    let classe="";

    if(idade>=60){
        if(imc<22) classe="Baixo Peso (Idoso)";
        else if(imc<=27) classe="Eutrofia (Idoso)";
        else classe="Excesso de Peso (Idoso)";
    }
    else{
        if(imc<18.5) classe="Baixo Peso";
        else if(imc<25) classe="Eutrofia";
        else classe="Sobrepeso";
    }

    if(getEl("classImc"))
        getEl("classImc").value=classe;

}

/* ================= PERDA DE PESO ================= */

function calcularPerdaPeso(){

    const pesoHabitual=getNum("pesoHab");
    const pesoAtual=getNum("peso");

    if(pesoHabitual<=0 || pesoAtual<=0){
        if(getEl("perdaPeso")) getEl("perdaPeso").value="";
        if(getEl("alertaPerdaPeso")) getEl("alertaPerdaPeso").value="";
        return;
    }

    const perda=((pesoHabitual-pesoAtual)/pesoHabitual)*100;
    const perdaAbs=Math.abs(perda);

    if(getEl("perdaPeso"))
        getEl("perdaPeso").value=perdaAbs.toFixed(2);

    let alerta="Sem alerta";

    if(perda>=10)
        alerta="🚨 Perda grave";
    else if(perda>=5)
        alerta="⚠ Perda moderada";

    if(getEl("alertaPerdaPeso"))
        getEl("alertaPerdaPeso").value=alerta;

}

/* ================= SARCOPENIA ================= */

function calcularSarcopenia(){

    const braco=getNum("circBraco");
    const pant=getNum("circPanturrilha");

    let res="Sem risco";

    if((braco>0 && braco<22)||(pant>0 && pant<31))
        res="Risco Sarcopênico";

    if(getEl("scoreSarcopenia"))
        getEl("scoreSarcopenia").value=res;

}

/* ================= NRS ================= */

function calcularNRS(){

    const nutri=getNum("nrsNutri");
    const grav=getNum("nrsGrav");
    const idadeBonus=getNum("idade")>=70?1:0;

    const total=nutri+grav+idadeBonus;

    if(getEl("nrsTotal"))
        getEl("nrsTotal").value=total;

    if(getEl("classNRS"))
        getEl("classNRS").value=
            total>=3
            ?"Risco Nutricional"
            :"Sem Risco";

}

/* ================= MNA ================= */

function calcularMNA(){

    let total=0;

    const campos=[
        "mnaA","mnaB","mnaC","mnaD","mnaE",
        "mnaG","mnaH","mnaI","mnaJ","mnaK",
        "mnaL","mnaM","mnaN","mnaO","mnaP",
        "mnaQ","mnaR"
    ];

    campos.forEach(id=>{
        total+=parseFloat(getVal(id))||0;
    });

    if(getEl("mnaTotal"))
        getEl("mnaTotal").value=total.toFixed(1);

    let classe=
        total<17
        ?"Desnutrido"
        :total<24
        ?"Risco de Desnutrição"
        :"Estado Nutricional Normal";

    if(getEl("classMNA"))
        getEl("classMNA").value=classe;

}

/* ================= ICN ================= */

function calcularICN(){

    const nome=obterPacienteAtivo();
    const banco=obterBanco();

    if(!nome) return;

    if(!banco[nome])
        banco[nome]={};

    let score=0;

    const mna=parseFloat(getVal("mnaTotal"))||0;

    if(mna<17) score+=3;
    else if(mna<24) score+=2;

    if(getNum("nrsTotal")>=3)
        score+=2;

    if((getEl("scoreSarcopenia")?.value||"").includes("Risco"))
        score+=1;

    if(getEl("icn"))
        getEl("icn").value=score;

    let classe=
        score>=4
        ?"Alto Risco"
        :score>=2
        ?"Risco Moderado"
        :"Baixo Risco";

    if(getEl("classICN"))
        getEl("classICN").value=classe;

    banco[nome].icn={
        score,
        classificacao:classe,
        data:new Date().toISOString()
    };

    salvarBanco(banco);

    atualizarPainelAlertas();

}

/* ================= ALERTAS ================= */

function atualizarPainelAlertas(){

    const painel=getEl("painelAlertas");
    if(!painel) return;

    let alertas=[];

    const imc=getNum("imc");

    if(getNum("idade")>=60 && imc>0 && imc<22)
        alertas.push("⚠ IMC Baixo (Idoso)");

    if(getEl("classICN") && getVal("classICN")==="Alto Risco")
        alertas.push("🚨 ICN: ALTO RISCO");

    if(getNum("nrsTotal")>=3)
        alertas.push("⚠ NRS ≥ 3");

    painel.innerHTML=
        alertas.length
        ?alertas.map(a=>`<div class="alerta-item">${a}</div>`).join("")
        :"✔ Sem alertas";

}

/* ================= FOTO DO RESIDENTE ================= */

const fotoInput=getEl("fotoUpload");
const fotoPreview=getEl("fotoPreview");

if(fotoInput){

    fotoInput.addEventListener("change",function(){

        const arquivo=this.files[0];
        if(!arquivo) return;

        const leitor=new FileReader();

        leitor.onload=function(e){

            if(fotoPreview)
                fotoPreview.src=e.target.result;

            const nome=obterPacienteAtivo();
            if(!nome) return;

            const banco=obterBanco();

            if(!banco[nome])
                banco[nome]={};

            banco[nome].foto=e.target.result;

            salvarBanco(banco);

        };

        leitor.readAsDataURL(arquivo);

    });

}

/* ================= EVENTO LOAD ================= */

document.addEventListener("DOMContentLoaded",function(){

    atualizarPacienteAtivoNavbar();

    const nome=obterPacienteAtivo();
    const banco=obterBanco();

    if(nome && banco[nome]){

        const p=banco[nome];

        if(p.dadosBasicos){

            Object.keys(p.dadosBasicos).forEach(k=>{
                if(getEl(k))
                    getEl(k).value=p.dadosBasicos[k];
            });

            if(getEl("nome"))
                getEl("nome").value=nome;

        }

        if(p.comorbidades){
            p.comorbidades.forEach(id=>{
                if(getEl(id)) getEl(id).checked=true;
            });
        }

        if(p.foto && getEl("fotoPreview"))
            getEl("fotoPreview").src=p.foto;

    }

    calcularIdade();
    calcularIMC();
    calcularSarcopenia();
    calcularNRS();
    calcularICN();
    calcularPerdaPeso();
    calcularKatz();

    /* RECÁLCULO AUTOMÁTICO */

    document.querySelectorAll("input, select").forEach(el=>{

        el.addEventListener("input",()=>{

            calcularIdade();
            calcularIMC();
            calcularPerdaPeso();
            calcularSarcopenia();
            calcularNRS();
            calcularMNA();
            calcularICN();
            calcularKatz();

        });

    });

});
