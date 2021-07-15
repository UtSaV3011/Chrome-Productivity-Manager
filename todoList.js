let list = [], cell1, cell2, cell3;
let ulList = document.getElementById('list');
let addToDoBtn = document.getElementById('addToDo');
addToDoBtn.addEventListener('click', addToDo);

chrome.storage.local.get("todoList", function (local) {
    if (local && local.todoList) {
        const todoList = local.todoList;
        for (let index = 0; index < todoList.length; index++) {
            list.push(todoList[index]);
            insertRowAndcells(todoList[index]);
        }
    }
});

function addToDo() {
    let data = document.getElementById('inputs').value;

    if (!data) {
        return;
    }
    list.push({ value: data, type: 'TODO' });
    insertRowAndcells({value: data, type: 'TODO'});
    chrome.storage.local.set({ todoList: list });
}

function insertRowAndcells(data) {
    const val = data.value;
    const type = data.type;

    const id = `${list.length - 1}`;

    let row = ulList.insertRow(0);
    cell1 = row.insertCell(0);
    cell2 = row.insertCell(1);

    cell3 = row.insertCell(2);

    cell2.innerHTML = `<input id=${id} type="button" value="Delete?" class="deleteRow">`;
    cell1.innerHTML = val;

    let btn = document.getElementById(id);
    btn.addEventListener("click", deleteRow);

    function deleteRow() {
        this.parentNode.parentNode.remove();
        list.splice(id, 1);
        chrome.storage.local.set({ todoList: list });
    }

    let parentSpan = document.createElement('span');
    parentSpan.className = type;
    parentSpan.id = `parentSpan${id}`;
    
    let childSpan = document.createElement('span');
    childSpan.className = type;
    childSpan.id = `childSpan${id}`;
    childSpan.innerText = type;

    let ddNode = createDropDown(id);

    let saveBtn = document.createElement('button');
    saveBtn.id = `save${id}`;
    saveBtn.className = 'saveButton'
    saveBtn.innerText = 'Update'

    parentSpan.appendChild(childSpan);
    parentSpan.appendChild(saveBtn);

    cell3.appendChild(parentSpan);

    saveBtn.addEventListener('click', updateTODOLitType);


    function updateTODOLitType() {
        const childNodeName = this.parentNode.childNodes[0].nodeName;
        if(childNodeName === 'SPAN') {
            ddNode.value = type;
            parentSpan.replaceChild(ddNode, childSpan);
        } else {
            const val = document.getElementById(`dd${id}`).value;
            childSpan.className = val;
            childSpan.id = `childSpan${id}`;
            childSpan.innerText = val;
            parentSpan.replaceChild(childSpan, ddNode);
            list[id].type = val;
            chrome.storage.local.set({todoList: list});
        }
    }
}

function createDropDown(id) {
    let dropdownNode = document.createElement('select');
    dropdownNode.id = `dd${id}`

    const options = ['TODO', 'ONGOING', 'COMPLETED'];
    for (let i = 0; i < options.length; i++) {
        var option = document.createElement("option");
        option.value = options[i];
        option.text = options[i];
        dropdownNode.appendChild(option);
    }
    return dropdownNode;
}