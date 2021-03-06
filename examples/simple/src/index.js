import rein from 'rein-state';
import h from 'hyperscript';


function Main(state) {

  const valElem = h('h1.val', state.val);

  const dom = h('.main',
    {
      onclick: () => {
        state.val += 1;
      },
    },
    valElem,
    List(state.list), 
  );

  rein.onUpdated(state, 'val', (val) => {
    valElem.innerHTML = val;
  });

  return dom;
}


function List(state) {

  const listElems = h('.list-elements',
    state.values.map((elemState) => {
      return createElem(elemState);
    })
  );

  state.text = "Default value";

  const textInput = h('input.list__text-input',
    {
      type: 'text',
      value: "Default value",
      onkeyup: (e) => {
        state.text = e.target.value;
      },
    }
  );

  const dom = h('.list',
    textInput,
    listElems,
    AppendButton(state),
  );

  state.values.onPush((elemState, index) => {
    listElems.appendChild(createElem(elemState));
  });

  state.values.onInsert((elemState, index) => {
    listElems.insertBefore(createElem(elemState), listElems.childNodes[index + 1]);
  });

  state.values.onRemove((index) => {
    listElems.removeChild(listElems.childNodes[index]);
  });

  let selectedElem = null;

  function createElem(elemState) {
    const listElem = ListElem(elemState);

    listElem.addEventListener('selected', (e) => {

      const index = Array.prototype.indexOf.call(listElems.children, e.target.parentNode);

      console.log("item selected:", index);

      if (selectedElem !== null) {
        selectedElem.classList.remove('list__element--selected');
      }

      selectedElem = listElem;
      listElem.classList.add('list__element--selected');

      dom.dispatchEvent(new Event('elem-clicked'));
    });

    listElem.addEventListener('insert-after', (e) => {
      const index = Array.prototype.indexOf.call(listElems.children, e.target.parentNode);
      console.log("insert after", index);
      state.values.insert(index, { value: state.text, selected: false });
    });

    listElem.addEventListener('remove', (e) => {
      const index = Array.prototype.indexOf.call(listElems.children, e.target.parentNode);
      console.log("remove", index);
      const removedState = state.values.remove(index);
      console.log(removedState);
    });

    return h('.list__element',
      listElem,
    );
  }

  return dom;
}


function ListElem(state) {

  const dom = h('.list-element',
    state.value,
    h('button.list-element__insert-after-btn',
      {
        onclick: (e) => {
          e.stopPropagation();
          dom.dispatchEvent(new Event('insert-after'));
        },
      },
      "Insert After",
    ),
    h('button.list-element__remove-btn',
      {
        onclick: (e) => {
          e.stopPropagation();
          dom.dispatchEvent(new Event('remove'));
        },
      },
      "Remove",
    ),
  );

  dom.addEventListener('click', () => {
    dom.dispatchEvent(new Event('selected'));
  });

  return dom;
}

function AppendButton(state) {
  return h('button', 
    {
      onclick: () => {
        state.values.push({ value: state.text, selected: false });
      },
    },
    "Append"
  );
};


const state = rein.fromObject({
  val: 5,
  s: "is texty",
  list: {
    text: null,
    values: [
      { value: 1, selected: false },
      { value: 2, selected: true },
    ]
  },
});

console.log(state);
//console.log(JSON.stringify(state, null, 2));

const root = document.getElementById('root');
root.appendChild(Main(state));

root.addEventListener('elem-clicked', (e) => {
  console.log("item clicked:", e.detail.index);
});

setTimeout(() => {
  state.val = 20;
}, 1000);
