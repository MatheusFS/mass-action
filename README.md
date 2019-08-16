# mass-action
 UX for mass actions

## Prelogue
This project uses [crud-stub](https://github.com/MatheusFS/crud-stub) as base CRUD design pattern
and [polid](https://github.com/MatheusFS/polid) as base CSS

# Instalation

```html
<script src="{{ asset('js/mass-action.js') }}" onload="massActionInit()" defer></script>
```
*obs:* if your html will be dinamically placed, use 'massActionInit()' after that.

show.blade.php
```html
<div massaction="mass_action" name="element_name">
```
show.blade.php
```html
<form method="post" name="element_name">
```

# Usage

index.blade.php
```javascript
function massActionInit() {

    new massAction($("[massaction]"), [
        {
            name: 'actionname', // Unique name to identify de action (recommended same as routename) 
            route:'{{route('routename')}}', // Laravel post route name 
            fields: ['id','name'], // Form fields to be sent
            icon:'check', // Font-awesome solid icon
            type:'primary', // Bootstrap context styling
            label:'Action #1' // Label to be displayed in Action Button and Context Menu
        }, // ...
    ]);
}
```