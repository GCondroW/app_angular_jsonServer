import { Component, Input, inject, OnInit  } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { GridOptions } from 'ag-grid-community';
import { DynamicModalComponent } from '../dynamic-modal/dynamic-modal.component';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css']
})
export class DataTableComponent implements OnInit {
	ngOnInit(){
		window.addEventListener('resize',()=>this.adjustContainerSize(), true);
		this.gridOptions.onGridReady=(params:any) => {
			console.log('The grid is now ready'),
			this.gridApi = params.api;
			this.gridColumnApi = params.columnApi;
			this.gridColumnApi.autoSizeAllColumns();
			this.adjustContainerSize();
		};
		console.log(this);
	};
	
	constructor(){


	}
	
	@Input() rowData:Array<any>=[];
	@Input() gridOptions:GridOptions<any>={};
	@Input() defaultColDef:any;
	@Input() deleteHandler:any;
	@Input() selectedDataId:number | null=null;
	@Input() gridApi:any;
	@Input() gridColumnApi:any;
	@Input() activeNav:any;
	@Input() navStates:any;
	@Input() refresh:any;
	@Input() downloadExcel:any;
	@Input() dbName:string="";

	public containerStyle:any={};
	public isActive=(item:any,comparedItem:any)=>{
		if(item===comparedItem)return true;
		return false;
	};
	public modalIsActive=false;
	
	private adjustContainerSize=()=>{
		let container=document.getElementById("gridTable")!;
		let containerRect=container.getBoundingClientRect();
		let containerRectTop=containerRect.top;
		////////////////////////////////////////////
		let innerTable=document.querySelectorAll('[Class=ag-center-cols-container]')[0];
		let innerTableRect=innerTable.getBoundingClientRect();
		let innerTableRectRight=innerTableRect.right;
		/////////////////////////////////////////////
		let scrollBar=document.querySelectorAll('[Class=ag-body-vertical-scroll-viewport]')[0];
		let scrollBarRect=scrollBar.getBoundingClientRect();
		let scrollBarRectWidth=scrollBarRect.width;
		//////////////////////////////////////////////
		let innerTableWidth=innerTable.getBoundingClientRect().width;
		let windowWidth=window.innerWidth;
		let width="30%";
		let height="100%";
		if(innerTableWidth>=windowWidth)width="auto";
		else{
			width=(innerTableRectRight+scrollBarRectWidth)+"px";
		}
		let marginBottom:number=-5;
		height=(window.innerHeight-containerRectTop+window.scrollY)+marginBottom+"px";
		this.containerStyle={
			width:width,
			height:height,
		};
	};
}
