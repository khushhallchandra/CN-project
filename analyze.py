import numpy as np
import pandas as pd
import matplotlib.pyplot as plt


def main(filename):
    data = pd.read_csv(filename, header=None)
    means = data.mean(axis = 0)
    stds = data.std(axis = 0)
    return means[0], means[1], stds[0], stds[1]

if __name__ == '__main__':
    files_http1 = ['./results/benchmark_size/http1_txt1.csv', './results/benchmark_size/http1_txt2.csv', './results/benchmark_size/http1_txt3.csv', './results/benchmark_size/http1_txt4.csv', './results/benchmark_size/http1_txt5.csv']
    files_quic = ['./results/benchmark_size/quic_txt1.csv', './results/benchmark_size/quic_txt2.csv', './results/benchmark_size/quic_txt3.csv', './results/benchmark_size/quic_txt4.csv', './results/benchmark_size/quic_txt5.csv']
    files_http2 = ['./results/benchmark_size/http2_txt1.csv', './results/benchmark_size/http2_txt2.csv', './results/benchmark_size/http2_txt3.csv', './results/benchmark_size/http2_txt4.csv', './results/benchmark_size/http2_txt5.csv']
    
    time_tot_quic, time_contentTransfer_quic = [], []
    std_tot_quic, std_contentTransfer_quic = [], []
    
    time_tot_http2, time_contentTransfer_http2 = [], []
    std_tot_http2, std_contentTransfer_http2 = [], []
    
    time_tot_http1, time_contentTransfer_http1 = [], []
    std_tot_http1, std_contentTransfer_http1 = [], []

    for f in files_quic:
        t1, t2, std1, std2 = main(f)

        time_contentTransfer_quic.append(t1)
        time_tot_quic.append(t2)

        std_contentTransfer_quic.append(2*std1)
        std_tot_quic.append(2*std2)

    for f in files_http2:
        t1, t2, std1, std2 = main(f)
        time_contentTransfer_http2.append(t1)
        time_tot_http2.append(t2)

        std_contentTransfer_http2.append(2*std1)
        std_tot_http2.append(2*std2)

    for f in files_http1:
        t1, t2, std1, std2 = main(f)
        time_contentTransfer_http1.append(t1)
        time_tot_http1.append(t2)

        std_contentTransfer_http1.append(2*std1)
        std_tot_http1.append(2*std2)

    x = [100, 1000, 10000, 100000, 1000000]
    time_tot_quic, time_contentTransfer_quic = np.array(time_tot_quic), np.array(time_contentTransfer_quic)
    std_tot_quic, std_contentTransfer_quic = np.array(std_tot_quic), np.array(std_contentTransfer_quic)
    time_tot_http2, time_contentTransfer_http2 = np.array(time_tot_http2), np.array(time_contentTransfer_http2)
    std_tot_http2, std_contentTransfer_http2 = np.array(std_tot_http2), np.array(std_contentTransfer_http2)
    time_tot_http1, time_contentTransfer_http1 = np.array(time_tot_http1), np.array(time_contentTransfer_http1)
    std_tot_http1, std_contentTransfer_http1 = np.array(std_tot_http1), np.array(std_contentTransfer_http1)

    fig, ax = plt.subplots()  
    ax.grid()
    ax.plot(x, time_contentTransfer_http1, 'o-', color='r', label="HTTP1")
    ax.plot(x, time_contentTransfer_http2, 'o-', color='g', label="SPDY")
    ax.plot(x, time_contentTransfer_quic, 'o-', color='b', label="QUIC") 

    ax.fill_between(x, time_contentTransfer_http1 - std_contentTransfer_http1, time_contentTransfer_http1 + std_contentTransfer_http1, color='gray', alpha=0.3)
    ax.fill_between(x, time_contentTransfer_http2 - std_contentTransfer_http2, time_contentTransfer_http2 + std_contentTransfer_http2, color='gray', alpha=0.3)
    ax.fill_between(x, time_contentTransfer_quic - std_contentTransfer_quic, time_contentTransfer_quic + std_contentTransfer_quic, color='gray', alpha=0.3)


    # ax.errorbar(x, time_contentTransfer_http2, yerr=std_contentTransfer_http2, fmt='-', color='r', label="HTTP2")
    # ax.errorbar(x, time_contentTransfer_quic, yerr=std_contentTransfer_quic, fmt='-', color='b', label="QUIC")
    ax.set_xlabel('Size of data (Length)')
    ax.set_ylabel('Time (in ms)')
    ax.legend()
    ax.set_xscale('log')
    ax.set_title('Comparison of Time Taken for Data Transfer')
    fig.savefig('results/plots/time_contentTransfer.png', dpi=fig.dpi)


    fig, ax = plt.subplots()  
    ax.grid()
    ax.plot(x, time_tot_http1, 'o-', color='r', label="HTTP1")
    ax.plot(x, time_tot_http2, 'o-', color='g', label="SPDY")
    ax.plot(x, time_tot_quic, 'o-', color='b', label="QUIC") 

    ax.fill_between(x, time_tot_http1 - std_tot_http1, time_tot_http1 + std_tot_http1, color='gray', alpha=0.3)
    ax.fill_between(x, time_tot_http2 - std_tot_http2, time_tot_http2 + std_tot_http2, color='gray', alpha=0.3)
    ax.fill_between(x, time_tot_quic - std_tot_quic, time_tot_quic + std_tot_quic, color='gray', alpha=0.3)
    # ax.errorbar(x, time_tot_http2, yerr=std_tot_http2, fmt='-', color='r', label="HTTP2")
    # ax.errorbar(x, time_tot_quic, yerr=std_tot_quic, fmt='-', color='b', label="QUIC")
    ax.set_xlabel('Size of data (Length)')
    ax.set_ylabel('Time (in ms)')
    ax.legend()
    ax.set_xscale('log')
    ax.set_title('Comparison of Total Time')
    fig.savefig('results/plots/total_time.png', dpi=fig.dpi)