# Project Info

Framer.Info =
	title: "Draw delete and Overlay confirm"
	author: "Pablo Vivanco"
	version: "1"


#Utilities

Framer.Extras.Hints.disable()


#General

flow = new FlowComponent
flow.showNext(userList)

#User List

scroll = new ScrollComponent
	scrollHorizontal: false
	directionLock: true
	y:0
	x: Align.center
	width: 375
	height: Screen.height
	parent: userList

contacts = new PageComponent
   parent: scroll.content
   width: 375
   height: 1036
   scrollHorizontal: false


contacts.addPage(items)
contacts.content.draggable.enabled = false
scroll.speedy = 2

user2.draggable = true
user2.draggable.vertical = false
user2.draggable.constraints =
	size: user2	
	
user2.states.a =
	x: 0

user2.onDrag ->
	if user2.x >= 0	
		user2.stateCycle("a")

	if user2.x > 200	
		user2.draggable = false
		
				
user2.onDragEnd ->
		
	if user2.x < -90
		flow.showOverlayBottom(userOverlay, modal: true)	
		user2.animate
			x: -115
			options:
				time: 0.2
				curve: Bezier.ease
	
hideOverlay.onClick ->
	flow.showPrevious()
	user2.animate
		x: 0
		options:
			time: 0.1
			curve: Bezier.easeOut

deleteItem.onTap ->
	flow.showPrevious()
	user2.animate
		x:-390
		options:
			time: 0.2
			curve: Bezier.easeOut
	deleteBg.animate
		x:-390
		options:
			time: 0.2
			curve: Bezier.easeOut
	moveList.animate
		y: 160
			


