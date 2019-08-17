# mass-action
 UX for mass actions

## Prelogue
This project uses [crud-stub](https://github.com/MatheusFS/crud-stub) as base CRUD design pattern
and [polid](https://github.com/MatheusFS/polid) as base CSS

# Instalation

```html
<script src="{{ asset('js/mass-action.js') }}" onload="massActionInit()" defer></script>
```
*obs: if your html will be asyncally placed, use `massActionInit()` after it.*

**show.blade.php**
```html
<!--
The HTML element considered as a single object has
massaction atribute with value of its available options
-->
<div massaction="actioname,..." name="element_name">
<!-- ... -->
<!-- The Form must have the same 'element_name' -->
<form method="post" name="element_name">
```

# Usage

**index.blade.php**
```javascript
function massActionInit() {

    new massAction(
        'body', // The canvas area elements and selectionability will be applied
        $("[massaction]"), // Default massaction selector *Deprecated
        [ // actions array
            {
                name: 'actionname', // Unique name to identify de action (recommended same as routename) 
                route:'{{route('routename')}}', // Laravel post route name 
                fields: ['id','name'], // Form fields to be sent
                icon:'check', // Font-awesome solid icon
                type:'primary', // Bootstrap context styling
                label:'Action #1', // Label to be displayed in Action Button and Context Menu
                hotkey: 'Delete' // The event.key that will also trigger the action
            }, // ...
        ], 
        ['#contextmenu', 'button', 'a', '.modal','nav', 'input'] // Selectors click has actions
    );
}
```