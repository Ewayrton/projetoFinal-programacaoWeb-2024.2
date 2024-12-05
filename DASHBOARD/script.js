let produtoEditandoId = null;

let chart4 = null; // Variável global para armazenar a instância do gráfico de quantidade
let chart5 = null; // Variável global para armazenar a instância do gráfico de lucro

function criarGrafico(labels, data_chart, data_lucro_percentual) {
    const ctx4 = document.getElementById("chart1").getContext("2d");
    const ctx5 = document.getElementById("chart2").getContext("2d");

    // Destroi os gráficos existentes, se houver
    if (chart4) {
        chart4.destroy();
    }
    if (chart5) {
        chart5.destroy();
    }

    // Criação do gráfico de quantidade de produtos
    chart4 = new Chart(ctx4, {
        type: "pie", // Tipo de gráfico
        data: {
            labels: labels, // Labels do gráfico
            datasets: [{
                label: "Quantidade de Produtos",
                data: data_chart, // Dados do gráfico de quantidade
                backgroundColor: ["#5056BF", "#65A6FA", "#6D74F2", "#9B57CC", "#00CADC"], // Cores do gráfico
                borderColor: "#FFFFFF", // Cor da borda
                borderWidth: 2 // Largura da borda
            }]
        }
    });

    // Criação do gráfico de lucro (percentual)
    chart5 = new Chart(ctx5, {
        type: "pie", // Tipo de gráfico
        data: {
            labels: labels, // Labels do gráfico
            datasets: [{
                label: "Lucro Percentual dos Produtos",
                data: data_lucro_percentual, // Dados do gráfico de lucro percentual
                backgroundColor: ["#FF8C42", "#FF6347", "#FFD700", "#FF1493", "#32CD32"], // Cores do gráfico de lucro
                borderColor: "#FFFFFF", // Cor da borda
                borderWidth: 2 // Largura da borda
            }]
        }
    });
}
//funcao para listar produtos
function listarProdutos() {
    fetch('https://parseapi.back4app.com/parse/classes/Produto', {
        method: 'GET',
        headers: {
            'X-Parse-Application-Id': 'IlO78lK8DrU6wOjy5KTVz3giRDowJ0aO64LZzq9F',
            'X-Parse-REST-API-Key': 'SGZSkF26vT0scc5ciiklDYOrR9ZVUkcAKzBpbiUF',
        }
    })
    .then(response => response.json())
    .then(data => {
        const produtos = data.results || [];
        const tableBody = document.querySelector('#produtosTable tbody');
        const labels = [];
        const data_chart = [];
        const data_lucro_percentual = [];

        // Limpa a tabela antes de preenchê-la
        tableBody.innerHTML = '';

        // Adiciona produtos à tabela e prepara os dados para os gráficos
        produtos.forEach(produto => {
            labels.push(produto.nome);
            data_chart.push(produto.quantidade);

            // Calculando o lucro percentual
            const lucro = produto.precoVenda - produto.preco;
            const lucroPercentual = (lucro / produto.precoVenda) * 100;
            data_lucro_percentual.push(lucroPercentual);

            const row = document.createElement('tr');
            row.innerHTML = `
        <td>${produto.nome}</td>
        <td>${produto.preco}</td>
        <td>${produto.quantidade}</td>
        <td>${produto.precoVenda || ''}</td>
        <td>
        <button class="btn-editar" onclick="editarProduto('${produto.objectId}', '${produto.nome}', ${produto.preco}, ${produto.quantidade}, ${produto.precoVenda})">Editar</button>
        <button class="btn-excluir" onclick="excluirProduto('${produto.objectId}')">Excluir</button>
        </td>
`;

            tableBody.appendChild(row);
        });

        // Atualiza os gráficos
        criarGrafico(labels, data_chart, data_lucro_percentual);
    })
    .catch(error => {
        console.error('Erro ao buscar produtos:', error);
        alert('Erro ao buscar produtos.');
        console.log('Erro ao buscar produtos.',error);
    });
}

// Função para adicionar novos produtos
document.getElementById('dadosForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const nome = document.getElementById('nome').value;
    const preco = Number(document.getElementById('preco').value);
    const qtd = Number(document.getElementById('qtd').value);
    const precoVenda = Number(document.getElementById('precoVenda').value);

    fetch('https://parseapi.back4app.com/parse/classes/Produto', {
        method: 'POST',
        headers: {
            'X-Parse-Application-Id': 'IlO78lK8DrU6wOjy5KTVz3giRDowJ0aO64LZzq9F',
            'X-Parse-REST-API-Key': 'SGZSkF26vT0scc5ciiklDYOrR9ZVUkcAKzBpbiUF',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, preco, quantidade: qtd, precoVenda })
    })
    .then(() => {
        alert('Produto adicionado com sucesso!');
        listarProdutos();
    })
    .catch(error => {
        console.error('Erro ao adicionar produto:', error);
        alert('Erro ao adicionar produto.');
    });
});