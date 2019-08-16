class massAction {

    constructor(elements, actions) {

        this._elements = elements;
        this._actions = actions;

        this.items = [];
        this.selected = [];
        this._mapElements();
        this._supportAreaSelection('body', ['#contextmenu', 'button', 'a', '.modal','nav']);
    }

    _isEventAllowed(event){

        let flag = true;
        this._excludedSelectors.forEach(selector => $(event.target).closest(selector).length == 1 ? flag = false : null);
        return flag;
    }

    _assignActionsClickEvents(){

        this._actions.forEach(action => $(`[name="${action.name}"]`).click(this._doAction.bind(this, action)));
    }

    _refreshAreaSelection() {

        this._areaSelectionDiv.offset = {
            left: Math.min(this.x1, this.x2),
            right: Math.max(this.x1, this.x2),
            top: Math.min(this.y1, this.y2),
            bottom: Math.max(this.y1, this.y2),
        };
        let offset = this._areaSelectionDiv.offset;
        this._areaSelectionDiv.style.left = offset.left + 'px';
        this._areaSelectionDiv.style.top = offset.top + 'px';
        this._areaSelectionDiv.style.width = offset.right - offset.left + 'px';
        this._areaSelectionDiv.style.height = offset.bottom - offset.top + 'px';
        return this._getItemsInAreaSelection();
    }

    _supportAreaSelection(canvas, excludedSelectors) {

        this.x1 = 0;
        this.y1 = 0;
        this.x2 = 0;
        this.y2 = 0;
        this._areaSelectionDiv = document.createElement('div');
        this._areaSelectionDiv.style.position = 'fixed';
        this._areaSelectionDiv.style.zIndex = 2;
        this._areaSelectionDiv.style.border = '1px dotted #333';
        this._areaSelectionDiv.style.backgroundColor = '#3490dc55';
        this._areaSelectionDiv.hidden = 1;
        this.clickCount = 0;
        this._excludedSelectors = excludedSelectors;
        this._canvas = canvas;
        this._refreshTimeout = 80;

        $(this._canvas).prepend(this._areaSelectionDiv);
        $(this._canvas).on('mousedown', this._MouseDown.bind(this));
        $(this._canvas).mouseup(this._MouseUp.bind(this));
        $(this._canvas).keyup(e => e.key === "Escape" ? this._unselectAll() : null);
        $(this._canvas).keyup(e => e.key === "Delete" ? alert('Deseja mesmo apagar?') : null);
        $('[massaction]').contextmenu(this._ContextMenu.bind(this));
    }

    _attachMouseMove(){

        if(this.isMouseDown) $(this._canvas).mousemove(this._MouseMove.bind(this));
    }

    _MouseDown(e){

        this.isMouseDown = 1;
        if(!this._isEventAllowed(e)) return;
        e.preventDefault();
        e.stopPropagation();

        this.clickCount++;
        if(this.clickCount == 2){
            this.clickCount = 0;
            this.items[$(e.target).closest('[massaction]').attr('name')].form.find('.modal').modal('show');
        }
        setTimeout(() => {this.clickCount = 0}, 400);

        $('#contextmenu').remove();

        $(this._canvas).mousemove(this._attachMouseMove.bind(this));
        
        this._areaSelectionDiv.hidden = 0;
        this.x1 = e.clientX;
        this.y1 = e.clientY;
        this.x2 = e.clientX;
        this.y2 = e.clientY;
        // this._refreshAreaSelection();
    }

    _MouseMove(e){

        this.x2 = e.clientX;
        this.y2 = e.clientY;
        this._highlightItemsInAreaSelection(this._refreshAreaSelection());
        $(this._canvas).unbind('mousemove');
        setTimeout(this._attachMouseMove.bind(this), this._refreshTimeout);
    }

    _MouseUp(e){

        this.isMouseDown = 0;
        $(this._canvas).unbind('mousemove');
        if(!e.ctrlKey) this._unselectAll();
        $('.highlighted').removeClass('highlighted');
        this._toggleItems(this._refreshAreaSelection());
        this._areaSelectionDiv.hidden = 1;
    }

    _ContextMenu(e){

        e.preventDefault();
        $('#contextmenu').remove();
        $(this._canvas).append(this._renderContextMenu(e));
        this._assignActionsClickEvents();
    }

    _renderContextMenu(e){

        return `
            <div id='contextmenu' class='list-group shadow' style='position:absolute;top:${e.pageY}px;left:${e.pageX}px'>
                ${this._actions.map(action => `
                    <li class='list-group-item list-group-item-action text-left p-2 lh-0' name='${action.name}'>
                        <i class='fas fa-${action.icon}-circle text-${action.type} mr-2'></i>
                        <label>${action.label}</label>
                    </li>
                `).join('')}
            </div>
        `;
    }

    _getItemsInAreaSelection(){

        let items = [];
        for(let item in this.items) {

            var itemBounds = this.items[item].element[0].getBoundingClientRect();

            if (this._areaSelectionDiv.offset.left <= itemBounds.right &&
            this._areaSelectionDiv.offset.top <= itemBounds.bottom &&
            this._areaSelectionDiv.offset.right >= itemBounds.left &&
            this._areaSelectionDiv.offset.bottom >= itemBounds.top) items.push(this.items[item]);
        }

        return items;
    }

    _mapElements() {

        $(this._elements).each((index, item) => {

            var checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = $(item).attr('massaction');
            checkbox.classList.add('d-none');

            $(item).before(checkbox);

            this.items[$(item).attr('name')] = {
                element: $(item),
                checkbox: checkbox,
                form: $(`form[name="${$(item).attr('name')}"]`)
            };
        });
    }

    _toggleItems(items) {

        items.forEach(item => {

            let itemSelectedIndex = this.selected.indexOf(item.element.attr('name'));
            
            item.checkbox.checked = item.checkbox.checked ? false : true;
            item.checkbox.checked ? this.selected.push(item.element.attr('name')) : this.selected.splice(itemSelectedIndex, 1);
        });
        this._refreshActionButton();
    }

    _unselectAll(){

        for(let item in this.items){
        
            this.items[item].checkbox.checked = false;
        }
        this.selected = [];
    }

    _highlightItemsInAreaSelection(items){

        $('.highlighted').removeClass('highlighted');
        items.forEach(item => item.element.addClass('highlighted'));
        this._refreshActionButton();
    }

    _refreshActionButton() {

        this.selected.length
            ? ($('#massaction-fab').length ? $('#massaction-fab').text(this.selected.length) : this._appendActionElements())
            : this._removeActionElements();
    }

    _appendActionElements() {

        let newButton = document.createElement('button');
        newButton.id = 'massaction-fab';
        newButton.classList.add('btn', 'btn-primary', 'btn-action');
        newButton.textContent = this.selected.length;

        $(this._canvas).append(newButton);
        $(this._canvas).append(this._renderActionList());
        this._assignActionsClickEvents();
    }

    _removeActionElements(){

        $('#massaction-fab').remove();
        $('#massaction-actions').remove();
    }

    _renderActionList() {

        return `
            <ul id='massaction-actions'>
                ${this._actions.map(action => `
                    <li class='badge-pill text-right'>
                        <label>${action.label}</label>
                        <button class='btn btn-${action.type} rounded-circle ml-2' name='${action.name}'>
                            <i class='fas fa-${action.icon}'></i>
                        </button>
                    </li>
                `).join('')}
            </ul>
        `;
    }

    _doAction(action){

        let postsRemaining = this.selected.length;
        this.selected.forEach(itemName => {

            let item = this.items[itemName];
            let jQueryString = 'input[name=_token],' + action.fields.map(field => `input[name*=\'[${field}]\']`);
            $.post(action.route, item.form.find(jQueryString).serialize()).done(data => {
                postsRemaining--;
                if(!postsRemaining) window.location.reload();
            });
        });
    }
}