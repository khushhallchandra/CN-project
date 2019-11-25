import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def main(filename):
    data = pd.read_csv(filename, header=None)
    means = data.mean(axis = 0)
    stds = data.std(axis = 0)
    return means[0], means[1], stds[0], stds[1]

if __name__ == '__main__':
    files_http1 = ['./results/benchmark_size/http1_num_1_txt3.csv', './results/benchmark_size/http1_num_5_txt3.csv', './results/benchmark_size/http1_num_25_txt3.csv', './results/benchmark_size/http1_num_50_txt3.csv', './results/benchmark_size/http1_num_100_txt3.csv', './results/benchmark_size/http1_num_500_txt3.csv']
    files_http2 = ['./results/benchmark_size/http2_num_1_txt3.csv', './results/benchmark_size/http2_num_5_txt3.csv', './results/benchmark_size/http2_num_25_txt3.csv', './results/benchmark_size/http2_num_50_txt3.csv', './results/benchmark_size/http2_num_100_txt3.csv', './results/benchmark_size/http2_num_500_txt3.csv']

    time_tot_http2, time_contentTransfer_http2 = [], []
    std_tot_http2, std_contentTransfer_http2 = [], []
    
    time_tot_http1, time_contentTransfer_http1 = [], []
    std_tot_http1, std_contentTransfer_http1 = [], []

    for f in files_http2:
        t1, t2, std1, std2 = main(f)
        # time_contentTransfer_http2.append(t1)
        time_tot_http2.append(t2)

        # std_contentTransfer_http2.append(2*std1)
        std_tot_http2.append(2*std2)

    for f in files_http1:
        t1, t2, std1, std2 = main(f)
        # time_contentTransfer_http1.append(t1)
        time_tot_http1.append(t2)

        # std_contentTransfer_http1.append(2*std1)
        std_tot_http1.append(2*std2)

    x = [1, 5, 25, 50, 100, 500]
    time_tot_http2 = np.array(time_tot_http2)
    std_tot_http2 = np.array(std_tot_http2)
    time_tot_http1 = np.array(time_tot_http1)
    std_tot_http1 = np.array(std_tot_http1)

    fig, ax = plt.subplots()  
    ax.grid()
    ax.plot(x, time_tot_http1, 'o-', color='r', label="HTTP1")
    ax.plot(x, time_tot_http2, 'o-', color='g', label="SPDY")

    ax.fill_between(x, time_tot_http1 - std_tot_http1, time_tot_http1 + std_tot_http1, color='gray', alpha=0.3)
    ax.fill_between(x, time_tot_http2 - std_tot_http2, time_tot_http2 + std_tot_http2, color='gray', alpha=0.3)
    # ax.errorbar(x, time_tot_http2, yerr=std_tot_http2, fmt='-', color='r', label="HTTP2")
    # ax.errorbar(x, time_tot_quic, yerr=std_tot_quic, fmt='-', color='b', label="QUIC")
    ax.set_xlabel('Number of times data sent')
    ax.set_ylabel('Time (in ms)')
    ax.legend()
    # ax.set_xscale('log')
    ax.set_title('Comparison of Total Time with Multiple Transfer')
    fig.savefig('results/plots/total_time_multi_data_transfer.png', dpi=fig.dpi)