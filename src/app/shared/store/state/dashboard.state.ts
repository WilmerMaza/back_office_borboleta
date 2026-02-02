import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { tap, catchError } from "rxjs";
import { of } from "rxjs";
import { GetStatisticsCount, GetRevenueChart } from "../action/dashboard.action";
import { StatisticsCount, RevenueChart } from "./../../interface/dashboard.interface";
import { DashboardService } from "../../services/dashboard.service";
import { HttpErrorResponse } from "@angular/common/http";

export class DashboardStateModel {
  statistics: StatisticsCount | null;
  revenueChart: RevenueChart | null
}

@State<DashboardStateModel>({
  name: "dashboard",
  defaults: {
    statistics: null,
    revenueChart: null
  },
})
@Injectable()
export class DashboardState {

  constructor(private dashboardService: DashboardService) {}

  @Selector()
  static statistics(state: DashboardStateModel) {
    return state.statistics;
  }

  @Selector()
  static revenueChart(state: DashboardStateModel) {
    return state.revenueChart;
  }

  @Action(GetStatisticsCount)
  getStatisticsCount(ctx: StateContext<DashboardStateModel>, action: GetStatisticsCount) {
    return this.dashboardService.getStatisticsCount(action.payload).pipe(
      tap({
        next: result => { 
          ctx.patchState({
            statistics: result,
          });
        }
      }),
      catchError((error: HttpErrorResponse | any) => {
        // Extraer mensaje de error de forma segura
        const errorMessage = this.extractErrorMessage(error);
        
        // Loggear el error para depuración
        console.error('Error al obtener estadísticas del dashboard:', errorMessage, error);
        
        // No actualizar el estado en caso de error, mantener el estado anterior
        // El error será manejado por el GlobalErrorHandlerInterceptor
        // Retornar un observable vacío para evitar que el error se propague y rompa la aplicación
        return of(null);
      })
    );
  }

  @Action(GetRevenueChart)
  getRevenueChart(ctx: StateContext<DashboardStateModel>) {
    return this.dashboardService.getRevenueChart().pipe(
      tap({
        next: result => { 
          ctx.patchState({
            revenueChart: result,
          });
        }
      }),
      catchError((error: HttpErrorResponse | any) => {
        // Extraer mensaje de error de forma segura
        const errorMessage = this.extractErrorMessage(error);
        
        // Loggear el error para depuración
        console.error('Error al obtener gráfico de ingresos:', errorMessage, error);
        
        // No actualizar el estado en caso de error, mantener el estado anterior
        // El error será manejado por el GlobalErrorHandlerInterceptor
        // Retornar un observable vacío para evitar que el error se propague y rompa la aplicación
        return of(null);
      })
    );
  }

  /**
   * Extrae el mensaje de error de forma segura
   */
  private extractErrorMessage(error: HttpErrorResponse | any): string {
    if (error instanceof HttpErrorResponse) {
      // Si es un HttpErrorResponse, intentar extraer el mensaje
      if (error.error && typeof error.error === 'object' && 'message' in error.error) {
        return error.error.message || 'Error desconocido';
      }
      if (typeof error.error === 'string') {
        return error.error;
      }
      return error.message || `Error ${error.status}: ${error.statusText}`;
    }
    
    // Si es un error genérico
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'Error desconocido al obtener datos del dashboard';
  }

}